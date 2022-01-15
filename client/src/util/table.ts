import { TableProps } from "react-data-table-component";

export const tableProps: Readonly<Partial<TableProps<any>>> = {
  responsive: true,
  striped: true,
  highlightOnHover: true,
  pointerOnHover: true,
  customStyles: {
    table: {
      style: {
        marginTop: 20,
      }
    },
  }
}