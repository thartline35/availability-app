import React, { useState } from 'react';

export default function TimeGroupedDashboard() {
    const timeSlots = Array.from({ length: 24 }, (_, i) => {
        const ampm = i < 12 ? 'AM' : 'PM';
        const hour = i === 0 ? 12 : i > 12 ? i - 12 : i;
        return `${hour}:00 ${ampm} PST`;
      });

  const mockData = {
    weekStarting: "2024-12-03",
    availabilityByTime: {
      Monday: {
        "12:00 AM PST": ["Maria Garcia"],
        "01:00 AM PST": ["Maria Garcia"],
        "02:00 AM PST": [],
        "03:00 AM PST": [],
        "04:00 AM PST": [],
        "05:00 AM PST": ["David Chen"],
        "06:00 AM PST": ["David Chen", "John Smith"],
        "07:00 AM PST": ["David Chen", "John Smith", "Alice Brown"],
        "08:00 AM PST": ["David Chen", "John Smith", "Alice Brown", "Maria Garcia"],
        "09:00 AM PST": ["David Chen", "John Smith", "Alice Brown", "Maria Garcia"],
        "10:00 AM PST": ["David Chen", "John Smith", "Alice Brown"],
        "11:00 AM PST": ["David Chen", "John Smith"],
        "12:00 PM PST": ["David Chen", "John Smith"],
        "1:00 PM PST": ["Alice Brown", "Maria Garcia"],
        "2:00 PM PST": ["Alice Brown", "Maria Garcia"],
        "3:00 PM PST": ["Alice Brown", "Maria Garcia"],
        "4:00 PM PST": ["Alice Brown"],
        "5:00 PM PST": ["Alice Brown"],
        "6:00 PM PST": ["John Smith"],
        "7:00 PM PST": ["John Smith"],
        "8:00 PM PST": [],
        "9:00 PM PST": [],
        "10:00 PM PST": ["Maria Garcia"],
        "11:00 PM PST": ["Maria Garcia"]
      },
      Tuesday: {
        "12:00 AM PST": ["Maria Garcia"],
        "01:00 AM PST": ["Maria Garcia"],
        "02:00 AM PST": ["Juan Jo", "Jane Do", "Cmore Butts"],
        "03:00 AM PST": [],
        "04:00 AM PST": [],
        "05:00 AM PST": ["David Chen"],
        "06:00 AM PST": ["David Chen", "John Smith"],
        "07:00 AM PST": ["David Chen", "John Smith", "Alice Brown"],
        "08:00 AM PST": ["David Chen", "John Smith", "Alice Brown", "Maria Garcia"],
        "09:00 AM PST": ["David Chen", "John Smith", "Alice Brown", "Maria Garcia"],
        "10:00 AM PST": ["David Chen", "John Smith", "Alice Brown"],
        "11:00 AM PST": ["David Chen", "John Smith"],
        "12:00 PM PST": ["David Chen", "John Smith"],
        "1:00 PM PST": ["Alice Brown", "Maria Garcia"],
        "2:00 PM PST": ["Alice Brown", "Maria Garcia"],
        "3:00 PM PST": ["Alice Brown", "Maria Garcia"],
        "4:00 PM PST": ["Alice Brown"],
        "5:00 PM PST": ["Alice Brown"],
        "6:00 PM PST": ["John Smith"],
        "7:00 PM PST": ["John Smith"],
        "8:00 PM PST": [],
        "9:00 PM PST": [],
        "10:00 PM PST": ["Maria Garcia"],
        "11:00 PM PST": ["Maria Garcia"]
      },
      Wednesday: {/* ... */},
      Thursday: {/* ... */},
      Friday: {/* ... */},
      Saturday: {/* ... */},
      Sunday: {/* ... */}
    }
  };

  const [currentWeek, setCurrentWeek] = useState(mockData.weekStarting);
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  const getCellBackground = (staffCount) => {
    if (staffCount === 0) return 'bg-gray-50';
    if (staffCount < 2) return 'bg-yellow-50';
    if (staffCount < 4) return 'bg-green-50';
    return 'bg-green-100';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Staff Availability Dashboard</h1>
            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <span className="text-gray-600">←</span>
              </button>
              <span className="font-medium text-gray-700">Week of {currentWeek}</span>
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <span className="text-gray-600">→</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10 border-r">
                    Time (PST)
                  </th>
                  {days.map(day => (
                    <th key={day} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {timeSlots.map((time, idx) => (
                  <tr key={time} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 bg-inherit border-r">
                      {time}
                    </td>
                    {days.map(day => {
                      const staffList = mockData.availabilityByTime[day]?.[time] || [];
                      return (
                        <td key={`${day}-${time}`} className={`px-6 py-4 whitespace-nowrap ${getCellBackground(staffList.length)}`}>
                          <div className="space-y-1">
                            {staffList.map(staff => (
                              <div key={staff} className="text-sm text-gray-700 bg-white/50 rounded px-3 py-1 shadow-sm">
                                {staff}
                              </div>
                            ))}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 bg-white rounded-lg shadow-sm p-4">
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-50 rounded border border-gray-200"></div>
              <span className="text-sm text-gray-600">No Staff</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-50 rounded border border-yellow-200"></div>
              <span className="text-sm text-gray-600">1 Staff Member</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-50 rounded border border-green-200"></div>
              <span className="text-sm text-gray-600">2-3 Staff Members</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 rounded border border-green-300"></div>
              <span className="text-sm text-gray-600">4+ Staff Members</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};