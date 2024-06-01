import { useEffect } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useActionData, useNavigate, useSubmit, useLoaderData } from "@remix-run/react";
import
{
  Page,
  Layout,
  LegacyCard,
  EmptyState
} from "@shopify/polaris";
import { TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import axios from "axios";

// components
import Widget from "~/components/Widget";


export const loader: LoaderFunction = async ({ request }) =>
{

  const { admin, session } = await authenticate.admin(request);
  const storeUrl = encodeURIComponent(session.shop);
  const apiURL = `http://localhost:3000/api/store/getID?storeUrl=${storeUrl}`;
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

export const action = async ({ request }: ActionFunctionArgs) =>
{
  const { admin, session } = await authenticate.admin(request);
  console.log('admin', admin);
  console.log('session', session);

};

export default function Index()
{
  const navigate = useNavigate();
  const actionData = useActionData<typeof action>();
  const submit = useSubmit();
  const shopify = useAppBridge();

  const loaderData: any = useLoaderData();
  console.log(loaderData);


  useEffect(() =>
  {
    // console.log('storeUrl dadfdfsds', shopify?.config.shop);
  }, [shopify]);

  const handleSetupClick = () =>
  {
    console.log('setup clicked');
  };


  return (
    <Page fullWidth>
      <TitleBar title="Cart Snapshot App">
        <button variant="primary" onClick={handleSetupClick}>
          Setup Widget
        </button>
      </TitleBar>
      <Layout.Section variant="oneHalf">
        <Widget />
      </Layout.Section>

      <Layout.Section variant="oneHalf">
        <LegacyCard sectioned>
          <EmptyState
            heading="Set your Widget"
            action={{ content: 'Setup Widget', onAction: handleSetupClick }}
            image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
            fullWidth
          >
            <p>
              start by setting the shareing widget
            </p>
          </EmptyState>
        </LegacyCard>
      </Layout.Section>
    </Page>
  );
}
