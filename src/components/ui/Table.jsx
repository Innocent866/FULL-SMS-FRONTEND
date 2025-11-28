const Table = ({ columns = [], data = [] }) => (
  <div className="overflow-hidden rounded-2xl border border-softGrey bg-white">
    <table className="w-full text-left text-sm">
      <thead className="bg-milk text-gray-600">
        <tr>
          {columns.map((column) => (
            <th key={column.accessor} className="px-4 py-3 font-medium">
              {column.Header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, idx) => (
          <tr key={idx} className="border-t border-softGrey/50">
            {columns.map((column) => (
              <td key={column.accessor} className="px-4 py-3">
                {column.Cell ? column.Cell(row) : row[column.accessor]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default Table;
