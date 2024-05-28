import { useState, useCallback, useEffect } from "react";
import
{
  Text,
  InlineStack,
  Box,
  Card,
  Button,
  Badge,
  BlockStack,
  useBreakpoints,
} from "@shopify/polaris";
import { useAppBridge } from "@shopify/app-bridge-react";

export default function Widget()
{

  const shopify = useAppBridge();
  const [enabled, setEnabled] = useState(true);
  const contentStatus = enabled ? 'Turn off' : 'Turn on';
  const toggleId = 'setting-toggle-uuid';
  const descriptionId = 'setting-toggle-description-uuid';
  const { mdDown } = useBreakpoints();
  const badgeStatus = enabled ? 'success' : undefined;
  const badgeContent = enabled ? 'On' : 'Off';

  const handleToggle = useCallback(() => setEnabled((enabled) => !enabled), []);

  // const handleToggle = useCallback(async () =>
  // {
  //   const newEnabledState = !enabled;
  //   setEnabled(newEnabledState);

  //   // Call API with the new state
  //   if (newEnabledState)
  //   {

  //     try
  //     {
  //       // TODO: Call API to enable the widget
  //       console.log('Widget enabled');
  //       console.log('shopify', shopify);

  //     } catch (error)
  //     {
  //       console.error('Failed to update store info:', error);
  //     }
  //   }
  // }, [enabled]);

  // smaller components
  const title = 'WIdget';
  const description =
    'Lorem Ipsum is simply dummy text of the printing';
  const settingStatusMarkup = (
    <Badge
      tone={badgeStatus}
      toneAndProgressLabelOverride={`Setting is ${badgeContent}`}
    >
      {badgeContent}
    </Badge>
  );


  const settingTitle = title ? (
    <InlineStack gap="200" wrap={false}>
      <InlineStack gap="200" align="start" blockAlign="baseline">
        <label htmlFor={toggleId}>
          <Text variant="headingMd" as="h6">
            {title}
          </Text>
        </label>
        <InlineStack gap="200" align="center" blockAlign="center">
          {settingStatusMarkup}
        </InlineStack>
      </InlineStack>
    </InlineStack>
  ) : null;

  const actionMarkup = (
    <Button
      role="switch"
      id={toggleId}
      ariaChecked={enabled ? 'true' : 'false'}
      onClick={handleToggle}
      size="slim"
    >
      {contentStatus}
    </Button>
  );

  const headerMarkup = (
    <Box width="100%">
      <InlineStack
        gap="1200"
        align="space-between"
        blockAlign="start"
        wrap={false}
      >
        {settingTitle}
        {!mdDown ? (
          <Box minWidth="fit-content">
            <InlineStack align="end">{actionMarkup}</InlineStack>
          </Box>
        ) : null}
      </InlineStack>
    </Box>
  );


  const descriptionMarkup = (
    <BlockStack gap="400">
      <Text id={descriptionId} variant="bodyMd" as="p" tone="subdued">
        {description}
      </Text>
      {mdDown ? (
        <Box width="100%">
          <InlineStack align="start">{actionMarkup}</InlineStack>
        </Box>
      ) : null}
    </BlockStack>
  );


  useEffect(() => { }, [shopify]);

  return (
    <Card>
      <BlockStack gap={{ xs: '400', sm: '500' }}>
        <Box width="100%">
          <BlockStack gap={{ xs: '200', sm: '400' }}>
            {headerMarkup}
            {descriptionMarkup}
          </BlockStack>
        </Box>
        <Text variant="bodyMd" as="p">
          Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s          </Text>
      </BlockStack>
    </Card>
  );
}
