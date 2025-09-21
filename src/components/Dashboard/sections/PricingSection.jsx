import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Crown, Star, Check, Edit, Trash2, Plus } from 'lucide-react';

const PricingSection = () => {
  const [pricingPlans, setPricingPlans] = useState([
    {
      id: 1,
      name: 'Accès Basic',
      price: 29,
      period: 'mois',
      features: [
        'Galerie photos exclusives',
        'Messages privés illimités',
        'Contenu hebdomadaire',
        'Support prioritaire'
      ],
      isActive: true,
      subscribers: 45
    },
    {
      id: 2,
      name: 'Premium VIP',
      price: 79,
      period: 'mois',
      features: [
        'Tout du Basic',
        'Vidéos exclusives HD',
        'Sessions streaming privées',
        'Contenu personnalisé',
        'Appels vidéo 1:1 (30min/mois)',
        'Accès prioritaire aux RDV'
      ],
      isActive: true,
      subscribers: 23
    },
    {
      id: 3,
      name: 'Ultimate Experience',
      price: 149,
      period: 'mois',
      features: [
        'Tout du Premium',
        'Streaming illimité',
        'Contenu personnalisé quotidien',
        'Appels vidéo illimités',
        'Accès VIP aux événements',
        'Concierge personnel'
      ],
      isActive: false,
      subscribers: 8
    }
  ]);

  const [isEditing, setIsEditing] = useState(null);
  const [newPlan, setNewPlan] = useState({
    name: '',
    price: '',
    period: 'mois',
    features: ['']
  });

  const togglePlanStatus = (id) => {
    setPricingPlans(plans =>
      plans.map(plan =>
        plan.id === id ? { ...plan, isActive: !plan.isActive } : plan
      )
    );
  };

  const addFeature = () => {
    setNewPlan(prev => ({
      ...prev,
      features: [...prev.features, '']
    }));
  };

  const updateFeature = (index, value) => {
    setNewPlan(prev => ({
      ...prev,
      features: prev.features.map((feature, i) => i === index ? value : feature)
    }));
  };

  const removeFeature = (index) => {
    setNewPlan(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <DollarSign className="w-6 h-6 text-green-500 mr-2" />
            Gestion des Tarifs
          </h2>
          <p className="text-gray-600">Configurez vos plans d'abonnement et tarifs</p>
        </div>
        <button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center">
          <Plus className="w-4 h-4 mr-2" />
          Nouveau Plan
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Revenus Mensuels</p>
              <p className="text-2xl font-bold text-green-600">€2,847</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Abonnés Actifs</p>
              <p className="text-2xl font-bold text-blue-600">76</p>
            </div>
            <Crown className="w-8 h-8 text-blue-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Taux de Conversion</p>
              <p className="text-2xl font-bold text-purple-600">12.4%</p>
            </div>
            <Star className="w-8 h-8 text-purple-500" />
          </div>
        </motion.div>
      </div>

      {/* Plans d'Abonnement */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {pricingPlans.map((plan, index) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-white rounded-lg shadow-sm border-2 transition-all duration-300 ${
              plan.isActive 
                ? 'border-green-200 shadow-lg' 
                : 'border-gray-200 opacity-75'
            }`}
          >
            <div className="p-6">
              {/* Header du Plan */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{plan.name}</h3>
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold text-gray-800">€{plan.price}</span>
                    <span className="text-gray-600 ml-1">/{plan.period}</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setIsEditing(plan.id)}
                    className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => togglePlanStatus(plan.id)}
                    className={`p-2 transition-colors ${
                      plan.isActive 
                        ? 'text-green-500 hover:text-green-600' 
                        : 'text-gray-400 hover:text-green-500'
                    }`}
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Statut */}
              <div className="mb-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  plan.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {plan.isActive ? 'Actif' : 'Inactif'}
                </span>
                <span className="ml-2 text-sm text-gray-600">
                  {plan.subscribers} abonnés
                </span>
              </div>

              {/* Fonctionnalités */}
              <ul className="space-y-2 mb-6">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center text-sm text-gray-600">
                    <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              {/* Actions */}
              <div className="flex space-x-2">
                <button className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors">
                  Voir Détails
                </button>
                <button className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors">
                  Modifier
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Formulaire Nouveau Plan */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Créer un Nouveau Plan</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom du Plan
            </label>
            <input
              type="text"
              value={newPlan.name}
              onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Ex: Plan Premium"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prix (€)
            </label>
            <input
              type="number"
              value={newPlan.price}
              onChange={(e) => setNewPlan({ ...newPlan, price: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="79"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fonctionnalités
          </label>
          {newPlan.features.map((feature, index) => (
            <div key={index} className="flex items-center space-x-2 mb-2">
              <input
                type="text"
                value={feature}
                onChange={(e) => updateFeature(index, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Fonctionnalité du plan"
              />
              <button
                onClick={() => removeFeature(index)}
                className="p-2 text-red-500 hover:text-red-600 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button
            onClick={addFeature}
            className="text-green-500 hover:text-green-600 text-sm font-medium flex items-center"
          >
            <Plus className="w-4 h-4 mr-1" />
            Ajouter une fonctionnalité
          </button>
        </div>

        <div className="flex justify-end space-x-2">
          <button className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors">
            Annuler
          </button>
          <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
            Créer le Plan
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default PricingSection;
