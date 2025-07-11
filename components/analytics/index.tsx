import GoogleAnalytics from "./google-analytics";
import OpenPanelAnalytics from "./open-panel";
import Plausible from "./plausible";

export default function Analytics() {
  // 在开发环境下，只加载 Google Analytics（如果配置了的话）
  if (process.env.NODE_ENV !== "production") {
    return <GoogleAnalytics />;
  }

  return (
    <>
      <OpenPanelAnalytics />
      <GoogleAnalytics />
      <Plausible />
    </>
  );
}
