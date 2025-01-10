import React, { useState, useEffect, useRef } from "react";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import moment from "moment-timezone";

const Calendar = ({ user }) => {
  const db = getFirestore();
  const [availability, setAvailability] = useState(
    Array(24)
      .fill(null)
      .map(() => Array(7).fill(false))
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saveStatus, setSaveStatus] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isNewUser, setIsNewUser] = useState(true);
  const [userTimezone, setUserTimezone] = useState("");
  const initialFetchDone = useRef(false);
  const [debugLogs, setDebugLogs] = useState([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState(null);
  const [selectionValue, setSelectionValue] = useState(null);

  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setUserTimezone(tz);
  }, []);

  const convertToPST = (localHour) => {
    const localDate = moment()
      .tz(userTimezone)
      .startOf("day")
      .add(localHour, "hours");
    return localDate.tz("America/Los_Angeles").hour();
  };

  const convertFromPST = (pstHour) => {
    const pstDate = moment()
      .tz("America/Los_Angeles")
      .startOf("day")
      .add(pstHour, "hours");
    return pstDate.tz(userTimezone).hour();
  };

  const formatHour = (hour) => {
    const date = new Date();
    date.setHours(hour, 0, 0);
    return date
      .toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
      .replace(":00", "");
  };

  const formatPSTHour = (hour) => {
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}${ampm}`;
  };

  const toggleAvailability = (hourIndex, dayIndex) => {
    console.log("Toggle called for:", hourIndex, dayIndex);

    setAvailability((prevAvailability) => {
      // Create a deep copy of the previous availability
      const newAvailability = prevAvailability.map((row) => [...row]);
      // Toggle the value
      newAvailability[hourIndex][dayIndex] =
        !prevAvailability[hourIndex][dayIndex];

      console.log(
        "New value at",
        hourIndex,
        dayIndex,
        ":",
        newAvailability[hourIndex][dayIndex]
      );
      return newAvailability;
    });
    setHasUnsavedChanges(true);
  };

  const handleMouseDown = (hourIndex, dayIndex) => {
    setIsSelecting(true);
    setSelectionStart({ hour: hourIndex, day: dayIndex });
    const newValue = !availability[hourIndex][dayIndex];
    setSelectionValue(newValue);

    // Update the initial cell
    setAvailability((prevAvailability) => {
      const newAvailability = prevAvailability.map((row) => [...row]);
      newAvailability[hourIndex][dayIndex] = newValue;
      return newAvailability;
    });
    setHasUnsavedChanges(true);
  };

  const handleMouseEnter = (hourIndex, dayIndex) => {
    if (!isSelecting || selectionStart === null) return;

    setAvailability((prevAvailability) => {
      const newAvailability = prevAvailability.map((row) => [...row]);
      const startHour = Math.min(selectionStart.hour, hourIndex);
      const endHour = Math.max(selectionStart.hour, hourIndex);
      const startDay = Math.min(selectionStart.day, dayIndex);
      const endDay = Math.max(selectionStart.day, dayIndex);

      for (let h = startHour; h <= endHour; h++) {
        for (let d = startDay; d <= endDay; d++) {
          newAvailability[h][d] = selectionValue;
        }
      }
      return newAvailability;
    });
    setHasUnsavedChanges(true);
  };

  const handleMouseUp = () => {
    setIsSelecting(false);
    setSelectionStart(null);
  };

  useEffect(() => {
    const fetchAvailability = async () => {
      if (!user?.email || !userTimezone || initialFetchDone.current) return;

      console.log("Fetching availability...");
      try {
        const docRef = doc(db, "availability", user.email);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data?.availability) {
            const newAvailability = Array(24)
              .fill(null)
              .map(() => Array(7).fill(false));

            Object.entries(data.availability).forEach(([key, value]) => {
              const [timeStr, dayStr] = key.split("_");
              let pstHour = parseInt(timeStr.replace(/[APM]/g, ""));
              if (timeStr.includes("PM") && pstHour !== 12) pstHour += 12;
              if (timeStr.includes("AM") && pstHour === 12) pstHour = 0;

              const dayIndex = daysOfWeek.indexOf(dayStr);
              if (dayIndex !== -1) {
                const localHour = convertFromPST(pstHour);
                newAvailability[localHour][dayIndex] = true;
              }
            });

            setAvailability(newAvailability);
            setIsNewUser(false);
          }
        }
        initialFetchDone.current = true;
      } catch (err) {
        console.error("Error fetching availability:", err);
        setError("Error loading your schedule. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, [user, userTimezone]);

  const saveSchedule = async () => {
    if (!user?.email || !userTimezone) return;

    setSaveStatus("Saving...");
    try {
      const docRef = doc(db, "availability", user.email);
      const availabilityObject = {};

      // Create the availability object ONLY from currently selected times
      for (let localHour = 0; localHour < 24; localHour++) {
        for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
          // Only add entries for true values
          if (availability[localHour][dayIndex]) {
            const pstHour = convertToPST(localHour);
            const key = `${formatPSTHour(pstHour)}_${daysOfWeek[dayIndex]}`;
            availabilityObject[key] = true;
          }
        }
      }

      // Replace the entire document with new data
      const dataToSave = {
        email: user.email,
        availability: availabilityObject, // This will replace all previous availability
        timezone: userTimezone,
        updatedAt: new Date(),
      };

      // Use set without merge option to replace the entire document
      await setDoc(docRef, dataToSave);

      setHasUnsavedChanges(false);
      setIsNewUser(false);
      setSaveStatus("Schedule saved successfully!");

      setTimeout(() => setSaveStatus(""), 3000);
    } catch (error) {
      console.error("Save error:", error);
      setSaveStatus(`Error saving schedule: ${error.message}`);
    }
  };

  useEffect(() => {
    window.addEventListener("mouseup", handleMouseUp);
    return () => window.removeEventListener("mouseup", handleMouseUp);
  }, []);

  // Added this useEffect to track availability changes
  useEffect(() => {
    console.log("Availability state changed:", availability);
  }, [availability]);

  if (loading) {
    return <div>Loading your schedule...</div>;
  }

  const timezoneName = userTimezone ? moment.tz(userTimezone).zoneAbbr() : "";

  return (
    <div style={{ padding: "10px" }}>
      <div
        style={{
          backgroundColor: "#e3f2fd",
          padding: "15px",
          borderRadius: "4px",
          marginBottom: "20px",
        }}
      >
        <h3>
          {isNewUser
            ? "Welcome to the Staff Availability Application!"
            : "Schedule Management"}
        </h3>
        <p>
          Select the times you're available for each day of the week. You can:
          <ul style={{ marginTop: "8px", marginBottom: "8px" }}>
            <li>Click to toggle individual time slots</li>
            <li>Update your schedule anytime if your availability changes</li>
          </ul>
          Your schedule will be displayed in your local time ({timezoneName})
          but stored in PST for team coordination.
        </p>
      </div>

      <div
        style={{
          marginBottom: "20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: hasUnsavedChanges ? "#fff3e0" : "transparent",
          padding: "10px",
          borderRadius: "4px",
        }}
      >
        <button
          onClick={saveSchedule}
          disabled={!hasUnsavedChanges}
          style={{
            padding: "10px 20px",
            backgroundColor: hasUnsavedChanges ? "#4CAF50" : "#cccccc",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: hasUnsavedChanges ? "pointer" : "not-allowed",
          }}
        >
          {isNewUser
            ? "Save Initial Schedule"
            : hasUnsavedChanges
            ? "Save Changes"
            : "No Changes to Save"}
        </button>

        {hasUnsavedChanges && (
          <div style={{ color: "#ff9800", marginLeft: "10px" }}>
            {isNewUser
              ? "Save your initial schedule!"
              : "You have unsaved changes"}
          </div>
        )}

        {saveStatus && (
          <div
            style={{
              color: saveStatus.includes("Error") ? "red" : "green",
              marginLeft: "10px",
            }}
          >
            {saveStatus}
          </div>
        )}
      </div>

      {error && (
        <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>
      )}

      <div
        style={{
          position: "relative",
          width: "100%",
          border: "1px solid #ddd",
          borderRadius: "4px",
          overflow: "hidden",
        }}
      >
        <table
          style={{
            borderCollapse: "collapse",
            width: "100%",
            tableLayout: "fixed",
          }}
        >
          <thead
            style={{
              position: "sticky",
              top: 0,
              backgroundColor: "white",
              zIndex: 1,
            }}
          >
            <tr>
              <th
                style={{
                  padding: "8px",
                  border: "1px solid #ddd",
                  width: "15%",
                }}
              >
                Hour ({timezoneName})
              </th>
              {daysOfWeek.map((day) => (
                <th
                  key={day}
                  style={{
                    padding: "8px",
                    border: "1px solid #ddd",
                    width: "12.14%",
                  }}
                >
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 24 }, (_, hourIndex) => (
              <tr key={hourIndex}>
                <td
                  style={{
                    padding: "8px",
                    border: "1px solid #ddd",
                    position: "sticky",
                    left: 0,
                    backgroundColor: "white",
                    zIndex: 1,
                    width: "15%",
                  }}
                >
                  {formatHour(hourIndex)}
                </td>
                {Array.from({ length: 7 }, (_, dayIndex) => (
                  <td
                    key={dayIndex}
                    style={{
                      padding: "8px",
                      border: "1px solid #ddd",
                      textAlign: "center",
                      cursor: "pointer",
                      userSelect: "none",
                      width: "12.14%",
                    }}
                    onMouseDown={() => handleMouseDown(hourIndex, dayIndex)}
                    onMouseEnter={() => handleMouseEnter(hourIndex, dayIndex)}
                  >
                    <div
                      style={{
                        backgroundColor: availability[hourIndex][dayIndex]
                          ? "#4CAF50"
                          : "#ffffff",
                        color: availability[hourIndex][dayIndex]
                          ? "white"
                          : "#000000",
                        padding: "8px",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        margin: "0",
                      }}
                    >
                      {availability[hourIndex][dayIndex]
                        ? "Available"
                        : "Select"}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: "20px", fontSize: "0.9em", color: "#666" }}>
        Your timezone: {userTimezone}
      </div>
    </div>
  );
};

export default Calendar;
