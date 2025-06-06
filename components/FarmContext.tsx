import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Farm {
  _id: string;
  name: string;
  location?: string;
  id_finca?: string;
}

interface FarmContextType {
  selectedFarm: Farm | null;
  selectFarm: (farm: Farm) => void;
  clearSelectedFarm: () => void;
  clearAllFarmData: () => Promise<void>;
  loading: boolean;
}

interface FarmProviderProps {
  children: ReactNode;
}

const FarmContext = createContext<FarmContextType | undefined>(undefined);

export const useFarm = (): FarmContextType => {
  const context = useContext(FarmContext);
  if (context === undefined) {
    throw new Error('useFarm must be used within a FarmProvider');
  }
  return context;
};

export const FarmProvider: React.FC<FarmProviderProps> = ({ children }) => {
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadSavedFarm = async (): Promise<void> => {
      try {
        const savedFarmJson = await AsyncStorage.getItem('selectedFarm');
        if (savedFarmJson) {
          setSelectedFarm(JSON.parse(savedFarmJson));
        }
      } catch (error) {
        console.error('Error loading saved farm:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSavedFarm();
  }, []);

  useEffect(() => {
    const saveFarm = async (): Promise<void> => {
      try {
        if (selectedFarm) {
          await AsyncStorage.setItem('selectedFarm', JSON.stringify(selectedFarm));
        } else {
          await AsyncStorage.removeItem('selectedFarm');
        }
      } catch (error) {
        console.error('Error saving farm:', error);
      }
    };

    if (!loading) {
      saveFarm();
    }
  }, [selectedFarm, loading]);

  const selectFarm = (farm: Farm): void => {
    setSelectedFarm(farm);
  };

  const clearSelectedFarm = (): void => {
    setSelectedFarm(null);
  };

  const clearAllFarmData = async (): Promise<void> => {
    try {
      setSelectedFarm(null);
      await AsyncStorage.removeItem('selectedFarm');
      const allKeys = await AsyncStorage.getAllKeys();
      const farmKeys = allKeys.filter(key => 
        key.includes('farm_') || 
        key.includes('selectedFarm') ||
        key.includes('farmPreferences')
      );
      
      if (farmKeys.length > 0) {
        await AsyncStorage.multiRemove(farmKeys);
      }
    } catch (error) {
      console.error('Error al limpiar datos de granjas:', error);
    }
  };

  const value: FarmContextType = {
    selectedFarm,
    selectFarm,
    clearSelectedFarm,
    clearAllFarmData,
    loading
  };

  return (
    <FarmContext.Provider value={value}>
      {children}
    </FarmContext.Provider>
  );
};

export default FarmContext; 