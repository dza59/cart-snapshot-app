import { useEffect } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useActionData, useNavigate, useSubmit, useLoaderData } from "@remix-run/react";
import
{
  Page,
  Layout,
  LegacyCard,
  EmptyState,
  Card,
  TextContainer,
} from "@shopify/polaris";
import { TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import axios from "axios";

// components
import Widget from "~/components/Widget";

// interface
interface Code
{
  code: string;
  products: number[];
}

interface storeData
{
  detail: {
    widgetSetting: {
      status: boolean;
      color: string;
      layout: string;
    };
    codes: Code[];
  };
}

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
  const loaderData: any = useLoaderData();
  console.log("loaderData", loaderData);


  const renderContent = () =>
  {
    if (loaderData.detail && loaderData.detail.codes.length === 0 && !loaderData.detail.widgetSetting.status)
    {
      // When codes array is empty and widget is off
      return (
        <EmptyState
          heading="No Codes Found"
          action={{ content: 'Setup Widget', onAction: () => console.log('Setup Widget') }}
          image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
          fullWidth
        >
          <p>Start by setting up the sharing widget.</p>
        </EmptyState>
      );
    } else
    {
      return (
        <Card>
          <TextContainer>
            <h2>Total Codes: {loaderData.detail.codes.length}</h2>
            {loaderData.detail.codes.map((code: Code, index: number) => (
              <p key={index}>Code: {code.code} - Products Count: {code.products.length}</p>
            ))}
          </TextContainer>
        </Card>
      );
    }
  };

  useEffect(() =>
  {
    // console.log('storeUrl dadfdfsds', shopify?.config.shop);
  }, [shopify]);

  const handleStatusChange = async (newStatus: boolean) =>
  {
    try
    {
      const response = await axios.put(`http://localhost:3000/api/widget/${loaderData.detail._id}`, {
        status: newStatus
      });
      console.log('Status update response:', response.data);
    } catch (error)
    {
      console.error('Failed to update widget status:', error);
    }
  };

  return (
    <Page fullWidth>
      <TitleBar title="Cart Snapshot App">
        {/* <button variant="primary" onClick={handleSetupClick}>
          Setup Widget
        </button> */}
      </TitleBar>
      <Layout.Section variant="oneHalf">
        <Widget storeId={loaderData.detail._id}
          initialStatus={loaderData.detail.widgetSetting.status}
        />
      </Layout.Section>

      <Layout.Section variant="oneHalf">
        <LegacyCard sectioned>
          {renderContent()}
        </LegacyCard>
      </Layout.Section>
    </Page>
  );
}
