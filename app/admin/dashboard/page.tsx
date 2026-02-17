"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";

import { Trash2, LogOut, RefreshCcw, Twitter, Globe, FileText, Upload, Image as ImageIcon, Film, Trophy } from "lucide-react";
import {
    collection,
    addDoc,
    serverTimestamp,
    query,
    orderBy,
    onSnapshot,
    deleteDoc,
    doc,
    getDocs,
    writeBatch
} from "firebase/firestore";
import { postTweet } from "@/app/actions/twitter";

interface NewsItem {
    id: string;
    title: string;
    url?: string;
    timestamp: any;
    postedToTwitter?: boolean;
    postSlug?: string;
    mediaUrl?: string;
    mediaType?: 'image' | 'video';
}

export default function AdminDashboard() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // UI State
    const [activeTab, setActiveTab] = useState<'global' | 'post'>('global');

    // Form State
    const [title, setTitle] = useState("");
    const [url, setUrl] = useState("");
    const [postSlug, setPostSlug] = useState("");
    const [postToTwitter, setPostToTwitter] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // File Upload State
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    // List State
    const [globalItems, setGlobalItems] = useState<NewsItem[]>([]);
    const [postItems, setPostItems] = useState<NewsItem[]>([]);

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
            if (!currentUser) {
                router.push("/admin/login");
            } else {
                setUser(currentUser);
                setLoading(false);
            }
        });

        const qGlobal = query(collection(db, "breaking_news"), orderBy("timestamp", "desc"));
        const unsubscribeGlobal = onSnapshot(qGlobal, (snapshot) => {
            const items = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as NewsItem[];
            setGlobalItems(items);
        });

        const qPost = query(collection(db, "post_live_updates"), orderBy("timestamp", "desc"));
        const unsubscribePost = onSnapshot(qPost, (snapshot) => {
            const items = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as NewsItem[];
            setPostItems(items);
        });

        return () => {
            unsubscribeAuth();
            unsubscribeGlobal();
            unsubscribePost();
        };
    }, [router]);

    const extractSlug = (input: string) => {
        if (!input) return "";
        try {
            if (input.startsWith("http")) {
                const urlObj = new URL(input);
                const pathSegments = urlObj.pathname.split("/").filter(Boolean);
                return pathSegments[pathSegments.length - 1] || input;
            }
            return input;
        } catch (e) {
            return input;
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const collectionName = activeTab === 'global' ? "breaking_news" : "post_live_updates";

            let mediaUrl = null;
            let mediaType = null;

            // 1. Upload File (Server-Side Proxy)
            if (file) {
                setUploading(true);
                const isVideo = file.type.startsWith('video/');
                mediaType = isVideo ? 'video' : 'image';

                // Create FormData
                const formData = new FormData();
                formData.append("file", file);

                // Upload via Server API
                const response = await fetch("/api/upload", {
                    method: "POST",
                    body: formData,
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || "Failed to upload file");
                }

                mediaUrl = data.url;
                setUploading(false);
            }

            const newItem: any = {
                title,
                url: url || null,
                timestamp: serverTimestamp(),
                createdAt: serverTimestamp(),
                mediaUrl: mediaUrl || null,
                mediaType: mediaType || null,
            };

            if (activeTab === 'post') {
                const cleanSlug = extractSlug(postSlug);
                if (!cleanSlug) {
                    alert("Debes ingresar el Slug o URL del Post.");
                    setSubmitting(false);
                    return;
                }
                newItem.postSlug = cleanSlug;
                newItem.postedToTwitter = postToTwitter;
            } else {
                newItem.postedToTwitter = postToTwitter;
            }

            await addDoc(collection(db, collectionName), newItem);

            // Twitter Integration
            if (postToTwitter) {
                try {
                    let tweetUrl = url || mediaUrl || ""; // Prioritize URL link, else media link
                    if (activeTab === 'post') {
                        tweetUrl = `https://www.lared1061.com/posts/${newItem.postSlug}`;
                    }

                    const result = await postTweet(title, tweetUrl || undefined); // Pass undefined if empty string
                    if (result.success) {
                        console.log("Posted to Twitter:", result);
                    }
                } catch (twitterError: any) {
                    console.error("Twitter Error:", twitterError);
                    alert("Guardado en DB, pero error al publicar en Twitter: " + twitterError.message);
                }
            }

            // Reset Form 
            setTitle("");
            // setUrl(""); 
            setFile(null);

            // Clear file input manually
            const fileInput = document.getElementById('mediaUpload') as HTMLInputElement;
            if (fileInput) fileInput.value = '';

        } catch (error: any) {
            console.error("Error adding document: ", error);
            alert("Error al guardar: " + error.message);
        } finally {
            setSubmitting(false);
            setUploading(false);
        }
    };

    const handleDelete = async (id: string, isGlobal: boolean) => {
        if (!confirm("¿Estás seguro de borrar esta noticia?")) return;
        const collectionName = isGlobal ? "breaking_news" : "post_live_updates";
        try {
            await deleteDoc(doc(db, collectionName, id));
        } catch (error) {
            console.error("Error deleting document: ", error);
        }
    };

    const handleFlush = async (isGlobal: boolean = true) => {
        const msg = isGlobal
            ? "⚠️ ¿ESTÁS SEGURO DE ELIMINAR TODAS LAS NOTICIAS GLOBALES? \nEsta acción no se puede deshacer."
            : "⚠️ ¿ESTÁS SEGURO DE ELIMINAR TODAS LAS ACTUALIZACIONES DE POSTS? \nEsta acción no se puede deshacer.";

        if (!confirm(msg)) return;

        setSubmitting(true);
        const collectionName = isGlobal ? "breaking_news" : "post_live_updates";

        try {
            const querySnapshot = await getDocs(collection(db, collectionName));
            const batch = writeBatch(db);

            querySnapshot.forEach((doc) => {
                batch.delete(doc.ref);
            });

            await batch.commit();
            alert("Todas las noticias han sido eliminadas.");
        } catch (error) {
            console.error("Error flushing documents: ", error);
            alert("Error al eliminar todas las noticias");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="p-10">Cargando...</div>;

    const currentItems = activeTab === 'global' ? globalItems : postItems;

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Panel Minuto a Minuto</h1>
                    <div className="flex gap-4">
                        <button
                            onClick={() => router.push('/admin/matches')}
                            className="flex items-center gap-2 px-4 py-2 bg-[#E40000] text-white hover:bg-red-700 rounded transition font-bold"
                        >
                            <Trophy size={18} /> Gestionar Partidos
                        </button>
                        <button
                            onClick={() => signOut(auth)}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-gray-700 transition"
                        >
                            <LogOut size={18} /> Salir
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 mb-6 border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab('global')}
                        className={`pb-3 px-4 font-bold flex items-center gap-2 transition ${activeTab === 'global' ? 'border-b-4 border-red-600 text-red-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <Globe size={20} /> Global (Homepage)
                    </button>
                    <button
                        onClick={() => setActiveTab('post')}
                        className={`pb-3 px-4 font-bold flex items-center gap-2 transition ${activeTab === 'post' ? 'border-b-4 border-red-600 text-red-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <FileText size={20} /> Por Post (Live Blog)
                    </button>
                </div>

                {/* Add New Item Form */}
                <div className="bg-white p-6 rounded-xl shadow-sm mb-8 border border-gray-100">
                    <h2 className="text-xl font-bold mb-4 text-gray-700">
                        {activeTab === 'global' ? 'Agregar Noticia Global' : 'Agregar Actualización a Post'}
                    </h2>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">

                        {/* Post Slug Field - Only for Post Tab */}
                        {activeTab === 'post' && (
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                <label className="block text-sm font-bold text-blue-800 mb-1">URL o Slug del Post (Target)</label>
                                <input
                                    type="text"
                                    value={postSlug}
                                    onChange={(e) => setPostSlug(e.target.value)}
                                    className="w-full p-2 border border-blue-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                                    placeholder="Ej: https://lared.com.gt/posts/partido-rojos-cremas o solo 'partido-rojos-cremas'"
                                    required
                                />
                                <p className="text-xs text-blue-600 mt-1">Pega la URL del artículo donde quieres que aparezca esta actualización.</p>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {activeTab === 'global' ? 'Título / Noticia' : 'Contenido de la Actualización'}
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                                placeholder={activeTab === 'global' ? "Escribe la noticia de último momento..." : "Minuto 45: Goool de..."}
                                required
                            />
                        </div>

                        {/* Media Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Imagen o Video (Opcional)</label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition cursor-pointer relative">
                                <input
                                    type="file"
                                    id="mediaUpload"
                                    accept="image/*,video/*"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                {file ? (
                                    <div className="flex items-center gap-2 text-green-600 font-medium">
                                        {file.type.startsWith('image') ? <ImageIcon size={24} /> : <Film size={24} />}
                                        <span>{file.name}</span>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center text-gray-400">
                                        <Upload size={32} className="mb-2" />
                                        <span className="text-sm">Haz clic o arrastra para subir (Imagen o Video)</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">URL Enlace (Opcional)</label>
                            <input
                                type="url"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                                placeholder="https://..."
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="twitterAuth"
                                checked={postToTwitter}
                                onChange={(e) => setPostToTwitter(e.target.checked)}
                                className="w-5 h-5 text-red-600 rounded focus:ring-red-500 border-gray-300"
                            />
                            <label htmlFor="twitterAuth" className="text-gray-700 flex items-center gap-2 cursor-pointer">
                                <Twitter size={18} className="text-blue-400" /> Publicar en X (Twitter)
                            </label>
                            {activeTab === 'post' && (
                                <span className="text-xs text-gray-400">(Enlazará al Post)</span>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className={`w-full py-3 rounded-lg font-bold text-white transition ${submitting ? 'bg-gray-400' : 'bg-[#E40000] hover:bg-red-700'}`}
                        >
                            {submitting ? (uploading ? 'Subiendo Archivo...' : 'Guardando...') : (activeTab === 'global' ? 'Publicar Noticia' : 'Publicar Actualización')}
                        </button>
                    </form>
                </div>

                {/* List of Items */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-700">
                            {activeTab === 'global' ? `Noticias Globales (${currentItems.length})` : `Actualizaciones por Post (${currentItems.length})`}
                        </h2>
                        {currentItems.length > 0 && (
                            <button
                                onClick={() => handleFlush(activeTab === 'global')}
                                className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg text-sm font-bold transition"
                            >
                                <Trash2 size={16} /> Eliminar Todas (Flush)
                            </button>
                        )}
                    </div>

                    <div className="flex flex-col gap-4">
                        {currentItems.map((item) => (
                            <div key={item.id} className="flex justify-between items-start p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition">
                                <div>
                                    <div className="text-xs text-gray-400 mb-1 flex gap-2 items-center">
                                        <span>{item.timestamp?.toDate ? item.timestamp.toDate().toLocaleString() : 'Reciente'}</span>
                                        {item.postSlug && (
                                            <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[10px] uppercase font-bold">
                                                Post: {item.postSlug}
                                            </span>
                                        )}
                                        {item.mediaUrl && (
                                            <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[10px] uppercase font-bold flex items-center gap-1">
                                                {item.mediaType === 'video' ? <Film size={10} /> : <ImageIcon size={10} />}
                                                Media
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="font-bold text-gray-800">{item.title}</h3>
                                    {item.url && <a href={item.url} target="_blank" className="text-blue-600 text-sm hover:underline block mt-1">{item.url}</a>}
                                    {item.postedToTwitter && <span className="inline-flex items-center gap-1 text-xs text-blue-400 mt-2 bg-blue-50 px-2 py-1 rounded"><Twitter size={12} /> Publicado en X</span>}
                                </div>
                                <button
                                    onClick={() => handleDelete(item.id, activeTab === 'global')}
                                    className="text-gray-400 hover:text-red-500 p-2 transition"
                                    title="Eliminar"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        ))}
                        {currentItems.length === 0 && (
                            <div className="text-center py-10 text-gray-400">
                                No hay registros en esta sección.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
