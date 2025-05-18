import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

interface SaveFunctions {
  basicInfo?: () => Promise<boolean>;
  appearance?: () => Promise<boolean>;
  welcomeSetting?: () => Promise<boolean>;
  humanHandoff?: () => Promise<boolean>;
}

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
  registerSaveFunction: (tabKey: number, saveFunction: () => Promise<boolean>) => void;
  unregisterSaveFunction: (tabKey: number) => void;
}

const ConfigurationContext = createContext<
  ConfigurationContextType | undefined
>(undefined);

export const useConfiguration = () => {
  const context = useContext(ConfigurationContext);
  if (!context) {
    throw new Error(
      "useConfiguration must be used within a ConfigurationProvider",
    );
  }
  return context;
};

export const ConfigurationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isDirty, setIsDirty] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingTabChange, setPendingTabChange] = useState<number | null>(null);
  const [currentTabKey, setCurrentTabKey] = useState<number>(1);
  const [hasChanges, setHasChanges] = useState<boolean>(false);
  const [saveFunctions, setSaveFunctions] = useState<SaveFunctions>({});

  const updateDirtyState = useCallback((value: boolean) => {
    setIsDirty(value);
    if (value) {
      setHasChanges(true);
    }
  }, []);

  const registerSaveFunction = useCallback((tabKey: number, saveFunction: () => Promise<boolean>) => {
    setSaveFunctions(prev => {
      const tabName = getTabName(tabKey);
      if (tabName) {
        return { ...prev, [tabName]: saveFunction };
      }
      return prev;
    });
  }, []);

  const unregisterSaveFunction = useCallback((tabKey: number) => {
    setSaveFunctions(prev => {
      const tabName = getTabName(tabKey);
      if (tabName && prev[tabName]) {
        const newSaveFunctions = { ...prev };
        delete newSaveFunctions[tabName];
        return newSaveFunctions;
      }
      return prev;
    });
  }, []);

  const getTabName = (tabKey: number): keyof SaveFunctions | null => {
    switch (tabKey) {
      case 1: return 'basicInfo';
      case 2: return 'appearance';
      case 3: return 'welcomeSetting';
      case 4: return 'humanHandoff';
      default: return null;
    }
  };

  console.log("ConfigurationContext state:", {
    isDirty,
    hasChanges,
    currentTabKey,
  });

  const handleTabChange = useCallback(
    (newTabKey: number) => {
      console.log("Trying to change tab to:", newTabKey, "Current state:", {
        isDirty,
        hasChanges,
      });

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
    },
    [isDirty, hasChanges, currentTabKey],
  );

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
      const currentTabName = getTabName(currentTabKey);
      if (currentTabName && saveFunctions[currentTabName]) {
        const success = await saveFunctions[currentTabName]!();
        if (success) {
          setIsDirty(false);
          setHasChanges(false);
          
          if (pendingTabChange !== null) {
            setCurrentTabKey(pendingTabChange);
            setPendingTabChange(null);
            setIsModalOpen(false);
          }
        }
      }
    } catch (error) {
      console.error("Failed to save changes:", error);
    }
  }, [currentTabKey, pendingTabChange, saveFunctions]);

  const discardChanges = useCallback(() => {
    setIsDirty(false);
    setHasChanges(false);
  }, []);

  const contextValue = useMemo(
    () => ({
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
      registerSaveFunction,
      unregisterSaveFunction,
    }),
    [
      isDirty,
      updateDirtyState,
      isModalOpen,
      pendingTabChange,
      confirmTabChange,
      cancelTabChange,
      handleTabChange,
      saveChanges,
      discardChanges,
      currentTabKey,
      registerSaveFunction,
      unregisterSaveFunction,
    ],
  );

  return (
    <ConfigurationContext.Provider value={contextValue}>
      {children}
    </ConfigurationContext.Provider>
  );
};
