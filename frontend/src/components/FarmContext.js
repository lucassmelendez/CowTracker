import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FarmContext = createContext();

export const useFarm = () => useContext(FarmContext);

export const FarmProvider = ({ children }) => {
  const [selectedFarm, setSelectedFarm] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSavedFarm = async () => {
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
    const saveFarm = async () => {
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

  const selectFarm = (farm) => {
    setSelectedFarm(farm);
  };

  const clearSelectedFarm = () => {
    setSelectedFarm(null);
  };

  return (
    <FarmContext.Provider
      value={{
        selectedFarm,
        selectFarm,
        clearSelectedFarm,
        loading
      }}
    >
      {children}
    </FarmContext.Provider>
  );
};

export default FarmContext;
