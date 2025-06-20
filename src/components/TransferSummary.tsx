import React, { useState } from 'react';
import { ArrowRight, User, Phone, MapPin, Building2, IndianRupee, Send } from 'lucide-react';

interface TransferSummaryProps {
  totalAmount: number;
}

interface TransferDetails {
  senderName: string;
  senderPhone: string;
  senderAddress: string;
  receiverName: string;
  receiverPhone: string;
  receiverBank: string;
  receiverIFSC: string;
  receiverAccount: string;
  amount: number;
  charges: number;
}

const TransferSummary: React.FC<TransferSummaryProps> = ({ totalAmount }) => {
  const [transferDetails, setTransferDetails] = useState<TransferDetails>({
    senderName: '',
    senderPhone: '',
    senderAddress: '',
    receiverName: '',
    receiverPhone: '',
    receiverBank: '',
    receiverIFSC: '',
    receiverAccount: '',
    amount: totalAmount,
    charges: Math.ceil(totalAmount * 0.02) // 2% transfer charges
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTransferDetails(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'amount' ? { charges: Math.ceil(Number(value) * 0.02) } : {})
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Save transfer details to history
    const savedTransfers = JSON.parse(localStorage.getItem('transferHistory') || '[]');
    const newTransfer = {
      ...transferDetails,
      id: Date.now(),
      date: new Date().toLocaleString(),
      status: 'Pending'
    };
    localStorage.setItem('transferHistory', JSON.stringify([newTransfer, ...savedTransfers]));
    alert('Transfer initiated successfully!');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
          <Send className="mr-2" /> New Transfer
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Sender Details */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 text-gray-700 flex items-center">
              <User className="mr-2" /> Sender Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="senderName"
                  value={transferDetails.senderName}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter sender's full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="senderPhone"
                  value={transferDetails.senderPhone}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter phone number"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  name="senderAddress"
                  value={transferDetails.senderAddress}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter full address"
                />
              </div>
            </div>
          </div>

          {/* Receiver Details */}
          <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 text-gray-700 flex items-center">
              <ArrowRight className="mr-2" /> Receiver Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="receiverName"
                  value={transferDetails.receiverName}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter receiver's full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="receiverPhone"
                  value={transferDetails.receiverPhone}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bank Name
                </label>
                <input
                  type="text"
                  name="receiverBank"
                  value={transferDetails.receiverBank}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter bank name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  IFSC Code
                </label>
                <input
                  type="text"
                  name="receiverIFSC"
                  value={transferDetails.receiverIFSC}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter IFSC code"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Number
                </label>
                <input
                  type="text"
                  name="receiverAccount"
                  value={transferDetails.receiverAccount}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter account number"
                />
              </div>
            </div>
          </div>

          {/* Transfer Amount */}
          <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 text-gray-700 flex items-center">
              <IndianRupee className="mr-2" /> Transfer Amount
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">₹</span>
                  <input
                    type="number"
                    name="amount"
                    value={transferDetails.amount}
                    onChange={handleInputChange}
                    required
                    className="w-full p-2 pl-8 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter amount"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Transfer Charges (2%)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">₹</span>
                  <input
                    type="number"
                    value={transferDetails.charges}
                    readOnly
                    className="w-full p-2 pl-8 bg-gray-100 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>
            <div className="mt-4 p-3 bg-white rounded-lg border border-green-200">
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Total Amount:</span>
                <span className="text-green-600">₹ {(transferDetails.amount + transferDetails.charges).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-indigo-700 transition-all shadow-md active:transform active:scale-95 flex items-center justify-center"
          >
            <Send className="mr-2" size={20} />
            Initiate Transfer
          </button>
        </form>
      </div>
    </div>
  );
};

export default TransferSummary;