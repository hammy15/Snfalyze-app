import { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc, onSnapshot, Timestamp } from 'firebase/firestore';
import { useRouter } from 'next/router';

export default function Deals() {
  const [deals, setDeals] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newDeal, setNewDeal] = useState({ name: '', type: 'Asset Purchase', structure: 'Owned Real Estate' });
  const router = useRouter();

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'deals'), (snap) => {
      setDeals(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return unsub;
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, 'deals'), {
      ...newDeal,
      status: 'Pipeline',
      createdAt: Timestamp.now()
    });
    setShowForm(false);
    setNewDeal({ name: '', type: 'Asset Purchase', structure: 'Owned Real Estate' });
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">All Deals</h1>
      <button
        className="mb-4 bg-blue-600 text-white px-4 py-2 rounded"
        onClick={() => setShowForm(!showForm)}
      >
        {showForm ? 'Cancel' : 'Add New Deal'}
      </button>

      {showForm && (
        <form onSubmit={handleAdd} className="mb-6 space-y-2">
          <input
            type="text"
            required
            placeholder="Deal Name"
            value={newDeal.name}
            onChange={e => setNewDeal({ ...newDeal, name: e.target.value })}
            className="border p-2 rounded w-full"
          />
          <select
            value={newDeal.type}
            onChange={e => setNewDeal({ ...newDeal, type: e.target.value })}
            className="border p-2 rounded w-full"
          >
            <option>Asset Purchase</option>
            <option>Membership Interest Purchase</option>
          </select>
          <select
            value={newDeal.structure}
            onChange={e => setNewDeal({ ...newDeal, structure: e.target.value })}
            className="border p-2 rounded w-full"
          >
            <option>Owned Real Estate</option>
            <option>Leasehold</option>
          </select>
          <button className="bg-green-600 text-white px-4 py-2 rounded" type="submit">
            Create Deal
          </button>
        </form>
      )}

      <table className="min-w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-4 py-2">Deal Name</th>
            <th className="border px-4 py-2">Type</th>
            <th className="border px-4 py-2">Structure</th>
            <th className="border px-4 py-2">Status</th>
            <th className="border px-4 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {deals.map(deal => (
            <tr key={deal.id} className="hover:bg-gray-50">
              <td className="border px-4 py-2">{deal.name}</td>
              <td className="border px-4 py-2">{deal.type}</td>
              <td className="border px-4 py-2">{deal.structure}</td>
              <td className="border px-4 py-2">{deal.status}</td>
              <td className="border px-4 py-2">
                <button
                  className="text-blue-700 underline"
                  onClick={() => router.push(`/deals/${deal.id}`)}
                >
                  Open
                </button>
              </td>
            </tr>
          ))}
          {deals.length === 0 && (
            <tr>
              <td className="border px-4 py-2 text-center" colSpan={5}>
                No deals yet. Click "Add New Deal"!
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
