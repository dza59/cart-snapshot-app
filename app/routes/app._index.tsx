import { useEffect, useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useActionData, useNavigate, useSubmit, useLoaderData } from "@remix-run/react";
import
{
  Page,
  Layout,
  EmptyState,
  Card,
  TextContainer,
} from "@shopify/polaris";
import { TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import axios from "axios";

// components
import Widget from "~/components/Widget";
import { Chart, registerables } from 'chart.js';
import { Line } from 'react-chartjs-2';
Chart.register(...registerables);
import { ClientOnly } from "remix-utils/client-only";


// interface
import { Code, LoaderData, ChartData } from "~/interfaces";

export const loader: LoaderFunction = async ({ request }) =>
{

  const { admin, session } = await authenticate.admin(request);
  const storeUrl = encodeURIComponent(session.shop);
  const apiURL = `http://localhost:3000/api/store/id?storeUrl=${storeUrl}`;
  let storeStatus = "existing"; // this is for testing, remove it later


  try
  {
    const idResponse = await axios.get(apiURL);

    let storeId = idResponse.data.storeId;

    // storeID found, fetch the store details, if not found, create a new store record and fetch the details
    if (!storeId)
    {
      const createStore = await axios.post(`http://localhost:3000/api/store`, { storeUrl: decodeURIComponent(storeUrl) });
      storeId = createStore.data.storeId;
      storeStatus = "new"
      console.log('new store, so created in DB', storeId);
      if (!storeId)
      {
        return json({ error: "Failed to create and fetch new store ID." });
      }
    }

    // Fetch the store details using the store ID
    const detailsResponse = await axios.get(`http://localhost:3000/api/store/${storeId}`);
    const storeDetails = detailsResponse.data;

    return json({ storeStatus: storeStatus, detail: storeDetails });
  } catch (error)
  {
    console.error("Error fetching store details:", error);
    return json({ error: "Failed to fetch store details." });
  }
};


export default function Index()
{
  const shopify = useAppBridge();
  const { detail } = useLoaderData<LoaderData>();
  console.log("detail", detail);
  const [chartData, setChartData] = useState<ChartData>({
    labels: [],
    datasets: [{
      label: 'Number of Codes Generated',
      data: [],
      borderColor: 'rgb(75, 192, 192)',
      backgroundColor: 'rgba(75, 192, 192, 0.5)',
    }]
  });


  useEffect(() =>
  {
    if (detail.codes.length)
    {
      const dates = detail.codes.map(code => new Date(code.createdAt).toLocaleDateString());
      const counts = detail.codes.map(code => code.products.length);
      console.log("counts", counts)

      setChartData(prevData => ({
        ...prevData,
        labels: dates,
        datasets: [{
          ...prevData.datasets[0],
          data: counts
        }]
      }));
    }
  }, [detail.codes]);

  const options = {
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value: any)
          {
            return Number.isInteger(value) ? value : '';
          }
        }
      }
    },
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Code Generation Chart',
      },
    },
  };

  return (
    <Page>
      <TitleBar title="Cart Snapshot App">
        {/* <button variant="primary" onClick={handleSetupClick}>
          Setup Widget
        </button> */}
      </TitleBar>
      <Layout.Section variant="oneHalf">
        <Widget storeId={detail._id} initialStatus={detail.widgetSetting.status} />

      </Layout.Section>

      <Layout.Section variant="oneHalf">
        <Card>
          <ClientOnly fallback={<div>Generating Chart...</div>}>
            {() => <Line options={options} data={chartData} />}
          </ClientOnly>
        </Card>
        {/* <LegacyCard sectioned>
          {renderContent()}
        </LegacyCard> */}
      </Layout.Section>
    </Page>
  );
}
