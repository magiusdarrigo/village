import { NeighborhoodType } from "../types";

type BoroughData = {
  title: string;
  neighborhoods: NeighborhoodType[];
};

const neighborhoodsData: BoroughData[] = [
  {
    title: "manhattan",
    neighborhoods: [],
  },
  {
    title: "brooklyn",
    neighborhoods: [],
  },
  {
    title: "queens",
    neighborhoods: [],
  },
  {
    title: "bronx",
    neighborhoods: [],
  },
  {
    title: "staten island",
    neighborhoods: [],
  },
];

export const getNeighborhoodsData = (neighborhoods: NeighborhoodType[]) => {
  neighborhoodsData.forEach((category) => {
    category.neighborhoods = neighborhoods.filter(
      (neighborhood) => neighborhood.borough === category.title
    );
  });
  return neighborhoodsData;
};

export const getSortedNeighborhoods = (neighborhoods: NeighborhoodType[]) => {
  return neighborhoods.sort((a, b) => a.name.localeCompare(b.name));
};
