import ImportMethodPage from "../ImportMethodPage";

export const dynamic = "force-dynamic";

export default function WorkDayCsvPage(props) {
  return <ImportMethodPage {...props} method="csv" />;
}
