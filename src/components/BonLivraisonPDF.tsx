import React from 'react';
import { Printer, Download } from 'lucide-react';

interface BonLivraisonPDFProps {
  bl: any;
  onClose: () => void;
}

export function BonLivraisonPDF({ bl, onClose }: BonLivraisonPDFProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header Actions */}
        <div className="bg-gray-100 px-6 py-4 flex items-center justify-between border-b print:hidden">
          <h3 className="text-lg font-semibold text-gray-900">
            Aperçu du Bon de Livraison #{bl.numero_bl}
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
        <div className="flex-1 overflow-y-auto p-8 bg-white" id="bl-content">
          {/* En-tête Entreprise */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <img 
                src="/africa-mobilier-logo.png" 
                alt="Africa Mobilier" 
                className="h-20 mb-4"
              />
              <div className="text-sm text-gray-600">
                <p className="font-semibold text-gray-900">AFRICA MOBILIER</p>
                <p>Casablanca, Maroc</p>
                <p>Tél: +212 XXX-XXXXXX</p>
                <p>Email: contact@africamobilier.com</p>
                <p>ICE: XXXXXXXXXX</p>
              </div>
            </div>
            <div className="text-right">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">BON DE LIVRAISON</h1>
              <div className="text-sm text-gray-600">
                <p><span className="font-semibold">N°:</span> {bl.numero_bl}</p>
                <p><span className="font-semibold">Date:</span> {new Date(bl.date_livraison).toLocaleDateString('fr-FR')}</p>
                {bl.commande?.numero_commande && (
                  <p><span className="font-semibold">Commande:</span> {bl.commande.numero_commande}</p>
                )}
                {bl.livreur && (
                  <p><span className="font-semibold">Livreur:</span> {bl.livreur}</p>
                )}
              </div>
            </div>
          </div>

          {/* Informations Client */}
          <div className="mb-8 bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Client</h3>
            <div className="text-sm text-gray-700">
              <p className="font-semibold">{bl.client?.raison_sociale || `${bl.client?.prenom} ${bl.client?.nom}`}</p>
              <p>{bl.client?.adresse}</p>
              <p>{bl.client?.code_postal} {bl.client?.ville}</p>
              <p>Tél: {bl.client?.telephone}</p>
              <p>Email: {bl.client?.email}</p>
            </div>
          </div>

          {/* Tableau des Articles */}
          <table className="w-full mb-8 border-collapse">
            <thead>
              <tr className="bg-blue-600 text-white">
                <th className="border border-gray-300 px-4 py-3 text-left">Désignation</th>
                <th className="border border-gray-300 px-4 py-3 text-center w-32">Qté Commandée</th>
                <th className="border border-gray-300 px-4 py-3 text-center w-32">Qté Livrée</th>
              </tr>
            </thead>
            <tbody>
              {bl.lignes?.map((ligne: any, index: number) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2">
                    <div className="font-medium">{ligne.designation}</div>
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    {ligne.quantite_commandee}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center font-medium">
                    {ligne.quantite_livree}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Notes */}
          {bl.notes && (
            <div className="mb-8 bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <p className="font-semibold text-gray-900 mb-1">Notes:</p>
              <p className="text-sm text-gray-700">{bl.notes}</p>
            </div>
          )}

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-8 mt-12">
            <div className="border-t-2 border-gray-300 pt-2">
              <p className="text-sm font-semibold text-gray-900">Signature du livreur</p>
              <p className="text-xs text-gray-500 mt-1">Date et signature</p>
              {bl.livreur && (
                <p className="text-sm text-gray-700 mt-4">{bl.livreur}</p>
              )}
            </div>
            <div className="border-t-2 border-gray-300 pt-2">
              <p className="text-sm font-semibold text-gray-900">Signature du client</p>
              <p className="text-xs text-gray-500 mt-1">Bon pour accord</p>
              {bl.signature_client && (
                <p className="text-sm text-gray-700 mt-4">{bl.signature_client}</p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 pt-6 border-t text-center text-xs text-gray-500">
            <p>Africa Mobilier - Excellence marocaine, Vision africaine</p>
            <p>RC: XXXXXX - ICE: XXXXXXXXXX - Patente: XXXXXX</p>
            <p className="mt-2">Merci de vérifier votre livraison et de signer pour réception</p>
          </div>
        </div>
      </div>

      {/* Styles d'impression */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #bl-content, #bl-content * {
            visibility: visible;
          }
          #bl-content {
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
