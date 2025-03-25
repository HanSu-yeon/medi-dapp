import React, { useEffect, useMemo, useState } from "react";
import { MaterialReactTable, useMaterialReactTable } from "material-react-table";
import { useWeb3 } from "../utils/Web3Provider";

export default function BCTable({ data }) {
	// console.log("dddd", data);

	//column definitions - strongly typed if you are using TypeScript (optional, but recommended)
	const columns = useMemo(
		() => [
			{
				accessorKey: "project", //simple recommended way to define a column
				header: "Project",
				muiTableHeadCellProps: { style: { color: "green" } }, //custom props
				enableHiding: false, //disable a feature for this column
			},
			{
				id: "id", //id required if you use accessorFn instead of accessorKey
				header: "userID",
				Header: <i style={{ color: "black" }}>id</i>, //optional custom markup
				accessorFn: (originalRow) => (originalRow.id ? originalRow.id : "N/A"),
				Cell: ({ cell }) => <i>{cell.getValue().toLocaleString()}</i>, //optional custom cell render
			},
			{
				id: "cls", //id required if you use accessorFn instead of accessorKey
				header: "cls",
				Header: <i style={{ color: "black" }}>cls</i>, //optional custom markup
				accessorFn: (originalRow) => (originalRow.cls ? parseFloat(originalRow.cls) : "N/A"),
				Cell: ({ cell }) => <i>{cell.getValue().toLocaleString()}</i>, //optional custom cell render
			},

			{
				accessorKey: "sbp",
				header: "sbp",
				Header: <i style={{ color: "black" }}>sbp</i>,
				accessorFn: (originalRow) => (originalRow.sbp ? parseFloat(originalRow.sbp) : "N/A"),
				Cell: ({ cell }) => <i>{cell.getValue().toLocaleString()}</i>,
			},
			{
				accessorKey: "tob",
				header: "tob",
				Header: <i style={{ color: "black" }}>tob</i>,
				accessorFn: (originalRow) => (originalRow.tob ? parseFloat(originalRow.tob) : "N/A"),
				Cell: ({ cell }) => <i>{cell.getValue().toLocaleString()}</i>,
			},
			{
				accessorKey: "ldl",
				header: "ldl",
				Header: <i style={{ color: "black" }}>ldl</i>,
				accessorFn: (originalRow) => (originalRow.ldl ? parseFloat(originalRow.ldl) : "N/A"),
				Cell: ({ cell }) => <i>{cell.getValue().toLocaleString()}</i>,
			},

			{
				accessorKey: "adi",
				header: "adi",
				Header: <i style={{ color: "black" }}>adi</i>,
				accessorFn: (originalRow) => (originalRow.adi ? parseFloat(originalRow.adi) : "N/A"),
				Cell: ({ cell }) => <i>{cell.getValue().toLocaleString()}</i>,
			},

			{
				accessorKey: "fmh",
				header: "fmh",
				Header: <i style={{ color: "black" }}>fmh</i>,
				accessorFn: (originalRow) => (originalRow.fmh ? parseFloat(originalRow.fmh) : "N/A"),
				Cell: ({ cell }) => <i>{cell.getValue().toLocaleString()}</i>,
			},
			{
				accessorKey: "tpa",
				header: "tpa",
				Header: <i style={{ color: "black" }}>tpa</i>,
				accessorFn: (originalRow) => (originalRow.tpa ? parseFloat(originalRow.tpa) : "N/A"),
				Cell: ({ cell }) => <i>{cell.getValue().toLocaleString()}</i>,
			},
			{
				accessorKey: "obs",
				header: "obs",
				Header: <i style={{ color: "black" }}>obs</i>,
				accessorFn: (originalRow) => (originalRow.obs ? parseFloat(originalRow.obs) : "N/A"),
				Cell: ({ cell }) => <i>{cell.getValue().toLocaleString()}</i>,
			},
			{
				accessorKey: "alc",
				header: "alc",
				Header: <i style={{ color: "black" }}>alc</i>,
				accessorFn: (originalRow) => (originalRow.alc ? parseFloat(originalRow.alc) : "N/A"),
				Cell: ({ cell }) => <i>{cell.getValue().toLocaleString()}</i>,
			},
			{
				accessorKey: "age",
				header: "age",
				Header: <i style={{ color: "black" }}>age</i>,
				accessorFn: (originalRow) => (originalRow.age ? parseFloat(originalRow.age) : "N/A"),
				Cell: ({ cell }) => <i>{cell.getValue().toLocaleString()}</i>,
			},
		],
		[]
	);
	// const table = useMaterialReactTable({
	// 	columns,
	// 	data,
	// 	initialState: { pagination: { pageSize: 50 } }, // 기본적으로 50개씩 표시
	// 	enablePagination: true, // 페이지네이션 활성화
	// });
	return <MaterialReactTable columns={columns} data={data} />;
	// return <MaterialReactTable table={table} />;
}
