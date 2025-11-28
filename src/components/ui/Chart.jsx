import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const Chart = ({ data = [], dataKey = 'value', labelKey = 'label', color = '#0A7D32' }) => (
  <div className="h-64">
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#EDEDED" />
        <XAxis dataKey={labelKey} stroke="#94A3B8" />
        <YAxis stroke="#94A3B8" />
        <Tooltip />
        <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={3} dot={{ r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

export default Chart;
