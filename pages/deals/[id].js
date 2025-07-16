import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { db, storage } from '../../firebase';
import { doc, getDoc, collection, addDoc, onSnapshot, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function DealWorkspace() {
  const router = useRouter();
  const { id } = router.query;
  const [deal, setDeal] = useState(null);

  // File upload state
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploads, setUploads] = useState([]);

  // Load deal info
  useEffect(() => {
    if (id) {
      getDoc(doc(db, 'deals', id)).then(snap => {
        if (snap.exists()) setDeal({ id: snap.id, ...snap.data() });
      });
      // Listen to uploaded files
      return onSnapshot(collection(db, 'deals', id, 'uploads'), snap => {
        setUploads(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
    }
  }, [id]);

  // Handle file upload
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;
    setUploading(true);
    // Upload to Storage
    const storageRef = ref(storage, `deals/${id}/${selectedFile.name}`);
    await uploadBytes(storageRef, selectedFile);
    const url = await getDownloadURL(storageRef);
    // Save file info in Firestore
    await addDoc(collection(db, 'deals', id, 'uploads'), {
      name: selectedFile.name,
      url,
      uploadedAt: Timestamp.now()
    });
    setSelectedFile(null);
    setUploading(false);
  };

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

      {/* File Upload Section */}
      <div className="mb-8">
        <h2 className="text-lg font-bold mb-2">Deal File Uploads</h2>
        <form onSubmit={handleUpload} className="flex items-center space-x-2 mb-2">
          <input
            type="file"
            onChange={e => setSelectedFile(e.target.files[0])}
            className="border p-2 rounded"
            disabled={uploading}
          />
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded"
            type="submit"
            disabled={!selectedFile || uploading}
