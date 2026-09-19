import ImportMethodPage from "../ImportMethodPage";

export const dynamic = "force-dynamic";

export default function WorkDayExcelPage(props) {
  return <ImportMethodPage {...props} method="excel" />;
}
