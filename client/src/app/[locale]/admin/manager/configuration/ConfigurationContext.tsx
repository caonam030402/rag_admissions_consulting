import React, { createContext, useState, useContext, useCallback, useMemo } from 'react';

interface ConfigurationContextType {
  isDirty: boolean;
  setIsDirty: (value: boolean) => void;
  isModalOpen: boolean;
  pendingTabChange: number | null;
  confirmTabChange: () => void;
  cancelTabChange: () => void;
  handleTabChange: (newTabKey: number) => void;
  saveChanges: () => Promise<void>;
  discardChanges: () => void;
  currentTabKey: number;
}

const ConfigurationContext = createContext<ConfigurationContextType | undefined>(undefined);

export const useConfiguration = () => {
  const context = useContext(ConfigurationContext);
  if (!context) {
    throw new Error('useConfiguration must be used within a ConfigurationProvider');
  }
  return context;
};

export const ConfigurationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDirty, setIsDirty] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingTabChange, setPendingTabChange] = useState<number | null>(null);
  const [currentTabKey, setCurrentTabKey] = useState<number>(1);
  const [hasChanges, setHasChanges] = useState<boolean>(false);

  const updateDirtyState = useCallback((value: boolean) => {
    setIsDirty(value);
    if (value) {
      setHasChanges(true);
    }
  }, []);

  console.log("ConfigurationContext state:", { isDirty, hasChanges, currentTabKey });

  const handleTabChange = useCallback((newTabKey: number) => {
    console.log("Trying to change tab to:", newTabKey, "Current state:", { isDirty, hasChanges });
    
    if (isDirty && newTabKey !== currentTabKey) {
      console.log("Showing confirmation modal for tab change");
      setIsModalOpen(true);
      setPendingTabChange(newTabKey);
    } else {
      console.log("Changing tab directly to:", newTabKey);
      setCurrentTabKey(newTabKey);
      setIsDirty(false);
      setHasChanges(false);
    }
  }, [isDirty, hasChanges, currentTabKey]);

  const confirmTabChange = useCallback(() => {
    if (pendingTabChange !== null) {
      setCurrentTabKey(pendingTabChange);
      setIsModalOpen(false);
      setIsDirty(false);
      setHasChanges(false);
      setPendingTabChange(null);
    }
  }, [pendingTabChange]);

  const cancelTabChange = useCallback(() => {
    setIsModalOpen(false);
    setPendingTabChange(null);
  }, []);

  const saveChanges = useCallback(async () => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setIsDirty(false);
      setHasChanges(false);
      
      if (pendingTabChange !== null) {
        setCurrentTabKey(pendingTabChange);
        setPendingTabChange(null);
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error("Failed to save changes:", error);
    }
  }, [pendingTabChange]);

  const discardChanges = useCallback(() => {
    setIsDirty(false);
    setHasChanges(false);
  }, []);

  const contextValue = useMemo(() => ({
    isDirty,
    setIsDirty: updateDirtyState,
    isModalOpen,
    pendingTabChange,
    confirmTabChange,
    cancelTabChange,
    handleTabChange,
    saveChanges,
    discardChanges,
    currentTabKey,
  }), [
    isDirty, 
    updateDirtyState,
    isModalOpen, 
    pendingTabChange, 
    confirmTabChange, 
    cancelTabChange, 
    handleTabChange, 
    saveChanges, 
    discardChanges,
    currentTabKey
  ]);

  return (
    <ConfigurationContext.Provider value={contextValue}>
      {children}
    </ConfigurationContext.Provider>
  );
}; 