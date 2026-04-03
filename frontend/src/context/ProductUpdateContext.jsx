import React, { createContext, useContext, useState, useCallback } from 'react';

const ProductUpdateContext = createContext(null);

export const useProductUpdates = () => {
  const context = useContext(ProductUpdateContext);
  if (!context) {
    throw new Error('useProductUpdates must be used within ProductUpdateProvider');
  }
  return context;
};

export const ProductUpdateProvider = ({ children }) => {
  const [updateTrigger, setUpdateTrigger] = useState(0);

  const notifyProductUpdate = useCallback(() => {
    setUpdateTrigger(prev => prev + 1);
  }, []);

  const value = {
    updateTrigger,
    notifyProductUpdate,
  };

  return <ProductUpdateContext.Provider value={value}>{children}</ProductUpdateContext.Provider>;
};
