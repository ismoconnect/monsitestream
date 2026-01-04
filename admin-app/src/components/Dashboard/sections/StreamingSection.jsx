import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Video, 
  Mic, 
  MicOff, 
  VideoOff, 
  Play, 
  Pause, 
  Square, 
  Users, 
  DollarSign, 
  Clock,
  Settings,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Star,
  Heart,
  MessageSquare
} from 'lucide-react';

const StreamingSection = () => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [viewers, setViewers] = useState(0);
  const [streamSettings, setStreamSettings] = useState({
    quality: 'HD',
    isPrivate: false,
    price: 0,
    maxViewers: 10,
    allowChat: true,
    allowTips: true
  });

  const [streamHistory, setStreamHistory] = useState([
    {
      id: 1,
      title: 'Stream Privé - Session Relaxante',
      date: '2024-01-15',
      duration: '45 min',
      viewers: 8,
      earnings: 120,
      status: 'completed'
    },
    {
      id: 2,
      title: 'Stream Public - Q&A',
      date: '2024-01-14',
      duration: '30 min',
      viewers: 25,
      earnings: 85,
      status: 'completed'
    },
    {
      id: 3,
      title: 'Stream Privé - Contenu Exclusif',
      date: '2024-01-13',
      duration: '60 min',
      viewers: 5,
      earnings: 200,
      status: 'completed'
    }
  ]);

  const [currentStream, setCurrentStream] = useState({
    title: '',
    description: '',
    category: 'private',
    price: 0
  });

  const videoRef = useRef(null);

  const startStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      setIsStreaming(true);
      setViewers(0);
      
      // Simuler l'arrivée de viewers
      const viewerInterval = setInterval(() => {
        setViewers(prev => prev + Math.floor(Math.random() * 3));
      }, 5000);
      
      return () => clearInterval(viewerInterval);
    } catch (error) {
      console.error('Erreur accès caméra:', error);
    }
  };

  const stopStream = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
    setIsRecording(false);
    setViewers(0);
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  const sendTip = (amount) => {
    // Simuler l'envoi d'un tip
    console.log(`Tip reçu: €${amount}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <Video className="w-6 h-6 text-purple-500 mr-2" />
            Streaming Privé
          </h2>
          <p className="text-gray-600">Gérez vos sessions de streaming en direct</p>
        </div>
        <div className="flex space-x-2">
          <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center">
            <Settings className="w-4 h-4 mr-2" />
            Paramètres
          </button>
          <button className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors flex items-center">
            <Video className="w-4 h-4 mr-2" />
            Nouveau Stream
          </button>
        </div>
      </div>

      {/* Contrôles de Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Zone de Stream */}
        <div className="lg:col-span-2">
          <div className="bg-black rounded-lg overflow-hidden shadow-lg">
            <div className="relative aspect-video bg-gray-900">
              {isStreaming ? (
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-white">
                    <Video className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg font-medium">Stream non démarré</p>
                    <p className="text-gray-400">Cliquez sur "Démarrer le Stream" pour commencer</p>
                  </div>
                </div>
              )}
              
              {/* Overlay de contrôles */}
              {isStreaming && (
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3">
                    <div className="flex items-center justify-between text-white">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                          <span className="text-sm font-medium">EN DIRECT</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4" />
                          <span className="text-sm">{viewers} viewers</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={toggleRecording}
                          className={`p-2 rounded-lg transition-colors ${
                            isRecording 
                              ? 'bg-red-500 hover:bg-red-600' 
                              : 'bg-gray-600 hover:bg-gray-500'
                          }`}
                        >
                          {isRecording ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={stopStream}
                          className="p-2 bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
                        >
                          <Square className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Contrôles de Stream */}
          <div className="mt-4 flex items-center justify-center space-x-4">
            {!isStreaming ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startStream}
                className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors flex items-center text-lg font-medium"
              >
                <Play className="w-5 h-5 mr-2" />
                Démarrer le Stream
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={stopStream}
                className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors flex items-center text-lg font-medium"
              >
                <Square className="w-5 h-5 mr-2" />
                Arrêter le Stream
              </motion.button>
            )}
          </div>
        </div>

        {/* Panneau de Contrôle */}
        <div className="space-y-4">
          {/* Statut du Stream */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-3">Statut du Stream</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Statut:</span>
                <span className={`text-sm font-medium ${
                  isStreaming ? 'text-green-600' : 'text-gray-600'
                }`}>
                  {isStreaming ? 'En Direct' : 'Hors ligne'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Viewers:</span>
                <span className="text-sm font-medium text-blue-600">{viewers}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Enregistrement:</span>
                <span className={`text-sm font-medium ${
                  isRecording ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {isRecording ? 'Actif' : 'Inactif'}
                </span>
              </div>
            </div>
          </div>

          {/* Paramètres du Stream */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-3">Paramètres</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Qualité
                </label>
                <select
                  value={streamSettings.quality}
                  onChange={(e) => setStreamSettings({...streamSettings, quality: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="SD">SD (480p)</option>
                  <option value="HD">HD (720p)</option>
                  <option value="FHD">Full HD (1080p)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prix par minute (€)
                </label>
                <input
                  type="number"
                  value={streamSettings.price}
                  onChange={(e) => setStreamSettings({...streamSettings, price: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Viewers
                </label>
                <input
                  type="number"
                  value={streamSettings.maxViewers}
                  onChange={(e) => setStreamSettings({...streamSettings, maxViewers: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={streamSettings.isPrivate}
                    onChange={(e) => setStreamSettings({...streamSettings, isPrivate: e.target.checked})}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Stream Privé</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={streamSettings.allowChat}
                    onChange={(e) => setStreamSettings({...streamSettings, allowChat: e.target.checked})}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Autoriser le Chat</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={streamSettings.allowTips}
                    onChange={(e) => setStreamSettings({...streamSettings, allowTips: e.target.checked})}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Autoriser les Tips</span>
                </label>
              </div>
            </div>
          </div>

          {/* Tips Rapides */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-3">Tips Rapides</h3>
            <div className="grid grid-cols-2 gap-2">
              {[5, 10, 25, 50].map(amount => (
                <button
                  key={amount}
                  onClick={() => sendTip(amount)}
                  className="p-2 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors text-sm font-medium"
                >
                  €{amount}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Historique des Streams */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Historique des Streams</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stream
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Durée
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Viewers
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gains
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {streamHistory.map((stream) => (
                <tr key={stream.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{stream.title}</div>
                      <div className="text-sm text-gray-500">ID: {stream.id}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {stream.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {stream.duration}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {stream.viewers}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    €{stream.earnings}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">
                      Voir
                    </button>
                    <button className="text-green-600 hover:text-green-900">
                      Replay
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StreamingSection;
