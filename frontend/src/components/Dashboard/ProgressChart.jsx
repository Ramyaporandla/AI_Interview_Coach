import { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { analyticsService } from '../../services/api'

export default function ProgressChart() {
  const [data, setData] = useState([
    { week: 'Week 1', score: 65 },
    { week: 'Week 2', score: 68 },
    { week: 'Week 3', score: 72 },
    { week: 'Week 4', score: 75 },
  ])

  useEffect(() => {
    analyticsService.getProgress('month')
      .then(response => {
        if (response.progress) {
          setData(response.progress)
        }
      })
      .catch(() => {
        // Use default data on error
      })
  }, [])

  return (
    <div className="w-full h-[250px] sm:h-[280px] md:h-[300px] px-2 sm:px-4 pb-4 sm:pb-6">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="week" 
            tick={{ fontSize: 10, fill: '#6b7280' }}
            style={{ fontSize: '10px' }}
          />
          <YAxis 
            domain={[0, 100]} 
            tick={{ fontSize: 10, fill: '#6b7280' }}
            style={{ fontSize: '10px' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '12px'
            }}
          />
          <Legend 
            wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
          />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#0ea5e9"
            strokeWidth={2}
            name="Average Score (%)"
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

