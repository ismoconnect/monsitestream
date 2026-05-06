import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Video,
  Play,
  Clock,
  Users,
  Lock,
  Crown,
  Calendar,
  Star,
  Heart,
  Mic,
  MicOff,
  Camera,
  Eye
} from 'lucide-react';

const ClientStreamingSection = ({ currentUser }) => {
  const navigate = useNavigate();
  const [isInStream, setIsInStream] = useState(false);
  const [currentStream, setCurrentStream] = useState(null);

  const sub = currentUser?.subscription;
  const currentPlan = (sub?.plan || sub?.type || sub?.planName || 'basic').toLowerCase();

  const isPremium = sub?.status === 'active' && (currentPlan.includes('premium') || currentPlan.includes('vip'));
  const isVIP = sub?.status === 'active' && currentPlan.includes('vip');

  const upcomingSessions = [
    {
      id: 1,
      title: 'Session Privée - Soirée Relaxante',
      scheduledFor: '2024-01-20T20:00:00',
      duration: 60,
      price: 50,
      type: 'private',
      maxViewers: 1,
      description: 'Moment de détente et de conversation privée'
    },
    {
      id: 2,
      title: 'Q&A Live - Questions & Réponses',
      scheduledFor: '2024-01-22T19:00:00',
      duration: 45,
      price: 25,
      type: 'group',
      maxViewers: 10,
      description: 'Répondez à vos questions en direct'
    }
  ];

  const pastSessions = [
    {
      id: 1,
      title: 'Session Privée - Conversation Intime',
      completedAt: '2024-01-15T21:00:00',
      duration: 45,
      price: 50,
      rating: 5,
      feedback: 'Moment magique, Liliana est exceptionnelle'
    },
    {
      id: 2,
      title: 'Soirée Jeux - Trivial Pursuit',
      completedAt: '2024-01-10T20:30:00',
      duration: 60,
      price: 30,
      rating: 4,
      feedback: 'Très amusant, on a bien rigolé'
    }
  ];

  const joinStream = (session) => {
    if (!isVIP) {
      return;
    }
    setCurrentStream(session);
    setIsInStream(true);
  };

  // Interface de streaming en cours
  if (isInStream && currentStream) {
    return (
      <div className="space-y-6">
        {/* Stream Header */}
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-800">{currentStream.title}</h2>
              <p className="text-gray-600">{currentStream.description}</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsInStream(false)}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Quitter
            </motion.button>
          </div>
        </div>

        {/* Stream Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Area */}
          <div className="lg:col-span-2">
            <div className="bg-black rounded-lg aspect-video relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <Video className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium">Stream en cours...</p>
                  <p className="text-gray-400">Connexion en cours avec Liliana</p>
                </div>
              </div>

              {/* Stream Controls */}
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
                        <span className="text-sm">1 viewer</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button className="p-2 bg-gray-600 rounded-lg hover:bg-gray-500 transition-colors">
                        <Mic className="w-4 h-4" />
                      </button>
                      <button className="p-2 bg-gray-600 rounded-lg hover:bg-gray-500 transition-colors">
                        <Camera className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Chat & Info */}
          <div className="space-y-4">
            {/* Session Info */}
            <div className="bg-white rounded-lg border p-4">
              <h3 className="font-semibold text-gray-800 mb-3">Informations</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Durée:</span>
                  <span className="font-medium">{currentStream.duration} min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Prix:</span>
                  <span className="font-medium text-green-600">{currentStream.price}€</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium">{currentStream.type === 'private' ? 'Privé' : 'Groupe'}</span>
                </div>
              </div>
            </div>

            {/* Chat */}
            <div className="bg-white rounded-lg border h-64 flex flex-col">
              <div className="p-3 border-b bg-gray-50">
                <h3 className="font-semibold text-gray-800">Chat</h3>
              </div>
              <div className="flex-1 p-3 overflow-y-auto">
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium text-purple-600">Liliana:</span>
                    <span className="text-gray-700 ml-2">Bonjour ! Comment allez-vous ?</span>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium text-blue-600">Vous:</span>
                    <span className="text-gray-700 ml-2">Très bien merci !</span>
                  </div>
                </div>
              </div>
              <div className="p-3 border-t">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Tapez un message..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                  />
                  <button className="px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm">
                    Envoyer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <Video className="w-6 h-6 text-purple-500 mr-2" />
            Sessions Live
          </h2>
          <p className="text-gray-600">Rejoignez Liliana en direct pour des moments exclusifs</p>
        </div>
        <div className="flex items-center space-x-2">
          <Crown className="w-5 h-5 text-yellow-500" />
          <span className="text-sm font-medium text-gray-600">VIP Elite</span>
        </div>
      </div>

      {/* Message d'accès limité */}
      {!isVIP && (
        <div className="text-center py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl p-8 max-w-md mx-auto"
          >
            <Lock className="w-16 h-16 text-purple-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Sessions Live VIP Elite</h3>
            <p className="text-gray-600 mb-4">
              L'accès aux sessions en direct est réservé aux membres VIP Elite.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/dashboard/subscription')}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg font-medium"
            >
              Passer VIP Elite
            </motion.button>
          </motion.div>
        </div>
      )}

      {/* Sessions à venir */}
      {isVIP && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-purple-500" />
            Prochaines Sessions
          </h3>

          <div className="grid md:grid-cols-2 gap-4">
            {upcomingSessions.map((session, index) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl border p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-gray-800">{session.title}</h4>
                  <span className={`text-xs px-2 py-1 rounded-full ${session.type === 'private'
                    ? 'bg-pink-100 text-pink-600'
                    : 'bg-blue-100 text-blue-600'
                    }`}>
                    {session.type === 'private' ? 'Privé' : 'Groupe'}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-4">{session.description}</p>

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    {new Date(session.scheduledFor).toLocaleDateString('fr-FR')} à {new Date(session.scheduledFor).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    {session.duration} minutes
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    Max {session.maxViewers} participants
                  </div>
                  <div className="flex items-center">
                    <span className="w-4 h-4 mr-2 text-center">€</span>
                    {session.price}€
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => joinStream(session)}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 rounded-lg font-medium hover:shadow-lg transition-shadow flex items-center justify-center"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Rejoindre la Session
                </motion.button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Historique */}
      {isVIP && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Star className="w-5 h-5 mr-2 text-gray-500" />
            Sessions Précédentes
          </h3>

          <div className="bg-white rounded-xl border overflow-hidden">
            {pastSessions.map((session, index) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-6 flex items-center justify-between ${index < pastSessions.length - 1 ? 'border-b' : ''
                  }`}
              >
                <div className="flex-1">
                  <h4 className="font-medium text-gray-800">{session.title}</h4>
                  <p className="text-sm text-gray-500 mb-2">
                    {new Date(session.completedAt).toLocaleDateString('fr-FR')} • {session.duration} min
                  </p>
                  <p className="text-sm text-gray-600 italic">"{session.feedback}"</p>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="flex items-center space-x-1 mb-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < session.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-green-600 font-medium">{session.price}€</span>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600">
                    <Play className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientStreamingSection;