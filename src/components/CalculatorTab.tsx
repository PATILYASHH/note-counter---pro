import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';

const CalculatorTab: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [hasCalculated, setHasCalculated] = useState(false);

  const handleNumberClick = (num: string) => {
    if (display === '0' || hasCalculated) {
      setDisplay(num);
      setHasCalculated(false);
    } else {
      setDisplay(display + num);
    }
  };

  const handleOperatorClick = (operator: string) => {
    if (hasCalculated) {
      setExpression(display + ' ' + operator + ' ');
      setHasCalculated(false);
    } else {
      setExpression(expression + display + ' ' + operator + ' ');
    }
    setDisplay('0');
  };

  const handleDecimalClick = () => {
    if (hasCalculated) {
      setDisplay('0.');
      setHasCalculated(false);
    } else if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const handleClearClick = () => {
    setDisplay('0');
    setExpression('');
    setHasCalculated(false);
  };

  const handleBackspaceClick = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  const handleEqualsClick = () => {
    try {
      const fullExpression = expression + display;
      // Using Function constructor to safely evaluate the expression
      // eslint-disable-next-line no-new-func
      const result = new Function('return ' + fullExpression.replace(/×/g, '*').replace(/÷/g, '/'))();
      setDisplay(String(result));
      setExpression(fullExpression + ' = ');
      setHasCalculated(true);
    } catch (error) {
      setDisplay('Error');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 max-w-md mx-auto">
      <div className="bg-gray-100 p-4 rounded-lg mb-4">
        <div className="text-gray-600 text-sm h-6 overflow-x-auto whitespace-nowrap">
          {expression}
        </div>
        <div className="text-3xl font-bold text-right overflow-x-auto">
          {display}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {/* First row */}
        <button 
          onClick={handleClearClick}
          className="bg-red-500 text-white p-3 rounded-lg font-medium hover:bg-red-600 active:bg-red-700 transition-colors"
          aria-label="Clear"
        >
          C
        </button>
        <button 
          onClick={handleBackspaceClick}
          className="bg-gray-200 p-3 rounded-lg font-medium hover:bg-gray-300 active:bg-gray-400 transition-colors flex items-center justify-center"
          aria-label="Backspace"
        >
          <ArrowLeft size={20} />
        </button>
        <button 
          onClick={() => handleOperatorClick('%')}
          className="bg-gray-200 p-3 rounded-lg font-medium hover:bg-gray-300 active:bg-gray-400 transition-colors"
          aria-label="Percent"
        >
          %
        </button>
        <button 
          onClick={() => handleOperatorClick('÷')}
          className="bg-indigo-500 text-white p-3 rounded-lg font-medium hover:bg-indigo-600 active:bg-indigo-700 transition-colors"
          aria-label="Divide"
        >
          ÷
        </button>

        {/* Second row */}
        <button 
          onClick={() => handleNumberClick('7')}
          className="bg-gray-100 p-3 rounded-lg font-medium hover:bg-gray-200 active:bg-gray-300 transition-colors"
          aria-label="Seven"
        >
          7
        </button>
        <button 
          onClick={() => handleNumberClick('8')}
          className="bg-gray-100 p-3 rounded-lg font-medium hover:bg-gray-200 active:bg-gray-300 transition-colors"
          aria-label="Eight"
        >
          8
        </button>
        <button 
          onClick={() => handleNumberClick('9')}
          className="bg-gray-100 p-3 rounded-lg font-medium hover:bg-gray-200 active:bg-gray-300 transition-colors"
          aria-label="Nine"
        >
          9
        </button>
        <button 
          onClick={() => handleOperatorClick('×')}
          className="bg-indigo-500 text-white p-3 rounded-lg font-medium hover:bg-indigo-600 active:bg-indigo-700 transition-colors"
          aria-label="Multiply"
        >
          ×
        </button>

        {/* Third row */}
        <button 
          onClick={() => handleNumberClick('4')}
          className="bg-gray-100 p-3 rounded-lg font-medium hover:bg-gray-200 active:bg-gray-300 transition-colors"
          aria-label="Four"
        >
          4
        </button>
        <button 
          onClick={() => handleNumberClick('5')}
          className="bg-gray-100 p-3 rounded-lg font-medium hover:bg-gray-200 active:bg-gray-300 transition-colors"
          aria-label="Five"
        >
          5
        </button>
        <button 
          onClick={() => handleNumberClick('6')}
          className="bg-gray-100 p-3 rounded-lg font-medium hover:bg-gray-200 active:bg-gray-300 transition-colors"
          aria-label="Six"
        >
          6
        </button>
        <button 
          onClick={() => handleOperatorClick('-')}
          className="bg-indigo-500 text-white p-3 rounded-lg font-medium hover:bg-indigo-600 active:bg-indigo-700 transition-colors"
          aria-label="Subtract"
        >
          -
        </button>

        {/* Fourth row */}
        <button 
          onClick={() => handleNumberClick('1')}
          className="bg-gray-100 p-3 rounded-lg font-medium hover:bg-gray-200 active:bg-gray-300 transition-colors"
          aria-label="One"
        >
          1
        </button>
        <button 
          onClick={() => handleNumberClick('2')}
          className="bg-gray-100 p-3 rounded-lg font-medium hover:bg-gray-200 active:bg-gray-300 transition-colors"
          aria-label="Two"
        >
          2
        </button>
        <button 
          onClick={() => handleNumberClick('3')}
          className="bg-gray-100 p-3 rounded-lg font-medium hover:bg-gray-200 active:bg-gray-300 transition-colors"
          aria-label="Three"
        >
          3
        </button>
        <button 
          onClick={() => handleOperatorClick('+')}
          className="bg-indigo-500 text-white p-3 rounded-lg font-medium hover:bg-indigo-600 active:bg-indigo-700 transition-colors"
          aria-label="Add"
        >
          +
        </button>

        {/* Fifth row */}
        <button 
          onClick={() => handleNumberClick('0')}
          className="bg-gray-100 p-3 rounded-lg font-medium hover:bg-gray-200 active:bg-gray-300 transition-colors col-span-2"
          aria-label="Zero"
        >
          0
        </button>
        <button 
          onClick={handleDecimalClick}
          className="bg-gray-100 p-3 rounded-lg font-medium hover:bg-gray-200 active:bg-gray-300 transition-colors"
          aria-label="Decimal point"
        >
          .
        </button>
        <button 
          onClick={handleEqualsClick}
          className="bg-indigo-600 text-white p-3 rounded-lg font-medium hover:bg-indigo-700 active:bg-indigo-800 transition-colors"
          aria-label="Equals"
        >
          =
        </button>
      </div>
    </div>
  );
};

export default CalculatorTab;