import React, { createContext, useContext, ReactNode } from "react";
import { useAssets } from "expo-asset";
import { Asset } from "expo-asset";

const assetPaths = [
  require("../assets/images/village-drawer-logo.png"),
  require("../assets/images/warning.png"),
];

// Define the type for the context value
interface AssetContextType {
  assets: Asset[] | null;
}

// Create context with initial null value and proper type
const AssetContext = createContext<AssetContextType>({ assets: null });

// Custom hook to use the asset context
export const useAssetContext = () => {
  const context = useContext(AssetContext);
  if (context === undefined) {
    throw new Error("useAssetContext must be used within a AssetProvider");
  }
  return context.assets;
};

interface AssetProviderProps {
  children: ReactNode;
}

export const AssetsContextProvider: React.FC<AssetProviderProps> = ({
  children,
}) => {
  const [assets, error] = useAssets(assetPaths);

  if (error) {
    console.error("Failed to load assets", error);
  }

  // Convert 'undefined' to 'null' to match AssetContextType expectations
  const assetsValue = assets || null;

  return (
    <AssetContext.Provider value={{ assets: assetsValue }}>
      {assets ? children : null}
    </AssetContext.Provider>
  );
};

export default AssetsContextProvider;
