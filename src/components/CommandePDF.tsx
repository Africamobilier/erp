import React from 'react';
import { Printer, Download } from 'lucide-react';

interface CommandePDFProps {
  commande: any;
  onClose: () => void;
}

export function CommandePDF({ commande, onClose }: CommandePDFProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header Actions */}
        <div className="bg-gray-100 px-6 py-4 flex items-center justify-between border-b print:hidden">
          <h3 className="text-lg font-semibold text-gray-900">
            Aperçu de la Commande #{commande.numero_commande}
          </h3>
          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimer</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Download className="w-4 h-4" />
              <span>PDF</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Fermer
            </button>
          </div>
        </div>

        {/* Document Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-white" id="commande-content">
          {/* En-tête Entreprise */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <img 
                src="/maghreb-office-logo.png" 
                alt="Maghreb Office" 
                className="h-20 mb-4"
              />
              <div className="text-sm text-gray-600">
                <p className="font-semibold text-gray-900">AFRICA MOBILIER</p>
                <p>Casablanca, Maroc</p>
                <p>Tél: +212 XXX-XXXXXX</p>
                <p>Email: contact@maghreboffice.com</p>
                <p>ICE: XXXXXXXXXX</p>
              </div>
            </div>
            <div className="text-right">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">BON DE COMMANDE</h1>
              <div className="text-sm text-gray-600">
                <p><span className="font-semibold">N°:</span> {commande.numero_commande}</p>
                <p><span className="font-semibold">Date:</span> {new Date(commande.date_commande).toLocaleDateString('fr-FR')}</p>
                {commande.date_livraison_prevue && (
                  <p><span className="font-semibold">Livraison prévue:</span> {new Date(commande.date_livraison_prevue).toLocaleDateString('fr-FR')}</p>
                )}
                <p><span className="font-semibold">Statut:</span> <span className="uppercase">{commande.statut}</span></p>
              </div>
            </div>
          </div>

          {/* Informations Client */}
          <div className="mb-8 bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Client</h3>
            <div className="text-sm text-gray-700">
              <p className="font-semibold">{commande.client?.raison_sociale || `${commande.client?.prenom} ${commande.client?.nom}`}</p>
              <p>{commande.client?.adresse}</p>
              <p>{commande.client?.code_postal} {commande.client?.ville}</p>
              <p>Tél: {commande.client?.telephone}</p>
              <p>Email: {commande.client?.email}</p>
            </div>
          </div>

          {/* Tableau des Articles */}
          <table className="w-full mb-8 border-collapse">
            <thead>
              <tr className="bg-primary-600 text-white">
                <th className="border border-gray-300 px-4 py-3 text-left">Désignation</th>
                <th className="border border-gray-300 px-4 py-3 text-center w-24">Qté</th>
                <th className="border border-gray-300 px-4 py-3 text-right w-32">P.U. HT</th>
                <th className="border border-gray-300 px-4 py-3 text-right w-32">Total HT</th>
              </tr>
            </thead>
            <tbody>
              {commande.lignes?.map((ligne: any, index: number) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2">
                    <div className="font-medium">{ligne.designation}</div>
                    {ligne.description && (
                      <div className="text-xs text-gray-600 mt-1">{ligne.description}</div>
                    )}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center">{ligne.quantite}</td>
                  <td className="border border-gray-300 px-4 py-2 text-right">
                    {ligne.prix_unitaire_ht?.toFixed(2)} MAD
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-right font-medium">
                    {ligne.montant_ht?.toFixed(2)} MAD
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totaux */}
          <div className="flex justify-end mb-8">
            <div className="w-64">
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Total HT:</span>
                <span className="font-semibold">{commande.montant_ht?.toFixed(2)} MAD</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">TVA (20%):</span>
                <span className="font-semibold">{commande.montant_tva?.toFixed(2)} MAD</span>
              </div>
              <div className="flex justify-between py-3 bg-primary-600 text-white px-3 rounded">
                <span className="font-bold">Total TTC:</span>
                <span className="font-bold text-xl">{commande.montant_ttc?.toFixed(2)} MAD</span>
              </div>
            </div>
          </div>

          {/* Conditions */}
          <div className="space-y-4 text-sm text-gray-600">
            {commande.notes && (
              <div>
                <p className="font-semibold text-gray-900 mb-1">Notes:</p>
                <p>{commande.notes}</p>
              </div>
            )}
            <div>
              <p className="font-semibold text-gray-900 mb-1">Conditions de paiement:</p>
              <p>{commande.conditions_paiement || 'Paiement à 30 jours'}</p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 pt-6 border-t text-center text-xs text-gray-500">
            <p>Maghreb Office - Excellence marocaine, Vision africaine</p>
            <p>RC: XXXXXX - ICE: XXXXXXXXXX - Patente: XXXXXX</p>
          </div>
        </div>
      </div>

      {/* Styles d'impression */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #commande-content, #commande-content * {
            visibility: visible;
          }
          #commande-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .print\\:hidden {
            display: none !important;
          }
          @page {
            margin: 1.5cm;
            size: A4;
          }
        }
      `}</style>
    </div>
  );
}
