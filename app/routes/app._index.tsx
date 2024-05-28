import { useEffect } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
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
import Widget from "~/components/Widget";

export const loader = async ({ request }: LoaderFunctionArgs) =>
{
  const { admin, session } = await authenticate.admin(request);
  console.log('admin', admin);
  console.log('session.shop', session.shop);
  return null;
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
