import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function DealWorkspace() {
  const router = useRouter();
  const { id } = router.query;
  const [deal, setDeal] = useState(null);

  useEffect(() => {
    if (id) {
      getDoc(doc(db, 'deals', id)).then(snap => {
        if (snap.exists()) setDeal({ id: snap.id, ...snap.data() });
      });
    }
  }, [id]);

  if (!deal) return <div className="p-10">Loading...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-2">{deal.name}</h1>
      <div className="mb-4">
        <span className="mr-4"><b>Type:</b> {deal.type}</span>
        <span className="mr-4"><b>Structure:</b> {deal.structure}</span>
        <span className="mr-4"><b>Status:</b> {deal.status}</span>
      </div>
      <hr className="mb-4" />
      <p>
        <b>Workspace coming soon!</b>
        <br />
        Here you’ll see deal files, uploads, AI prompts, analysis, and notes.
      </p>
    </div>
  );
}
