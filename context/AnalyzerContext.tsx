import React, { createContext, useState, useContext } from 'react';

const AnalyzerContext = createContext(null);

export function AnalyzerProvider({ children }) {
  const [history, setHistory] = useState([]);
  
  const addToHistory = (item) => {
    setHistory(prevHistory => [...prevHistory, item]);
  };
  
  return (
    <AnalyzerContext.Provider value={{ history, addToHistory }}>
      {children}
    </AnalyzerContext.Provider>
  );
}

export function useAnalyzer() {
  const context = useContext(AnalyzerContext);
  if (!context) {
    throw new Error('useAnalyzer must be used within an AnalyzerProvider');
  }
  return context;
}