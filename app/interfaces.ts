// Interfaces.ts
export interface Code {
  _id: string;
  products: any[];
  createdAt: string;
}

// export interface StoreData {
//   detail: {
//     widgetSetting: {
//       status: boolean;
//       color: string;
//       layout: string;
//     };
//     codes: Code[];
//   };
// }

export interface StoreDetails {
  codes: Code[];
  _id: string; // Ensure this exists on StoreDetails
  widgetSetting: {
    status: boolean;
    color: string;
    layout: string;
  };
}

export interface LoaderData {
  detail: StoreDetails;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
  }[];
}
