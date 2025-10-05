import { ParsedPurchase } from "../types";

interface TableViewProps {
  purchases: ParsedPurchase[];
}

export default function TableView({ purchases }: TableViewProps) {
  return (
    <div className="mt-8">
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl mb-4">
            Purchase History ({purchases.length} items)
          </h2>

          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>App</th>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map((purchase, index) => (
                  <tr key={index}>
                    <td>{purchase.date}</td>
                    <td>{purchase.appName}</td>
                    <td>{purchase.title}</td>
                    <td>
                      <span className="badge badge-outline">
                        {purchase.documentType}
                      </span>
                    </td>
                    <td className="font-mono">
                      {purchase.currency} {purchase.amount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
