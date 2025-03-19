import { useEffect, useMemo, useState } from "react";
import { MaterialReactTable, useMaterialReactTable } from "material-react-table";

//If using TypeScript, define the shape of your data (optional, but recommended)

//mock data - strongly typed if you are using TypeScript (optional, but recommended)

export default function Table() {
	const [data, setData] = useState([]);

	//column definitions - strongly typed if you are using TypeScript (optional, but recommended)
	const columns = useMemo(
		() => [
			{
				accessorKey: "class_field", //simple recommended way to define a column
				header: "Class",
				muiTableHeadCellProps: { style: { color: "green" } }, //custom props
				enableHiding: false, //disable a feature for this column
			},
			{
				accessorFn: (originalRow) => parseFloat(originalRow.sbp), //alternate way
				id: "sbp", //id required if you use accessorFn instead of accessorKey
				header: "Sbp",
				Header: <i style={{ color: "black" }}>Sbp</i>, //optional custom markup
				Cell: ({ cell }) => <i>{cell.getValue().toLocaleString()}</i>, //optional custom cell render
			},
			{
				accessorFn: (originalRow) => parseFloat(originalRow.tobacco), //alternate way
				id: "tobacco", //id required if you use accessorFn instead of accessorKey
				header: "Tobacco",
				Header: <i style={{ color: "black" }}>Tobacco</i>, //optional custom markup
				Cell: ({ cell }) => <i>{cell.getValue().toLocaleString()}</i>, //optional custom cell render
			},
			{
				accessorFn: (originalRow) => parseFloat(originalRow.ldl), //alternate way
				id: "ldl", //id required if you use accessorFn instead of accessorKey
				header: "Ldl",
				Header: <i style={{ color: "black" }}>Ldl</i>, //optional custom markup
				Cell: ({ cell }) => <i>{cell.getValue().toLocaleString()}</i>, //optional custom cell render
			},
			{
				accessorFn: (originalRow) => parseFloat(originalRow.adiposity), //alternate way
				id: "adiposity", //id required if you use accessorFn instead of accessorKey
				header: "Adiposity",
				Header: <i style={{ color: "black" }}>Adiposity</i>, //optional custom markup
				Cell: ({ cell }) => <i>{cell.getValue().toLocaleString()}</i>, //optional custom cell render
			},
			{
				accessorFn: (originalRow) => parseFloat(originalRow.famhist), //alternate way
				id: "famhist", //id required if you use accessorFn instead of accessorKey
				header: "Famhist",
				Header: <i style={{ color: "black" }}>Famhist</i>, //optional custom markup
				Cell: ({ cell }) => <i>{cell.getValue().toLocaleString()}</i>, //optional custom cell render
			},
			{
				accessorFn: (originalRow) => parseFloat(originalRow.typea), //alternate way
				id: "typea", //id required if you use accessorFn instead of accessorKey
				header: "Typea",
				Header: <i style={{ color: "black" }}>Typea</i>, //optional custom markup
				Cell: ({ cell }) => <i>{cell.getValue().toLocaleString()}</i>, //optional custom cell render
			},
			{
				accessorFn: (originalRow) => parseFloat(originalRow.obesity), //alternate way
				id: "obesity", //id required if you use accessorFn instead of accessorKey
				header: "Obesity",
				Header: <i style={{ color: "black" }}>Obesity</i>, //optional custom markup
				Cell: ({ cell }) => <i>{cell.getValue().toLocaleString()}</i>, //optional custom cell render
			},

			{
				accessorFn: (originalRow) => parseFloat(originalRow.alcohol), //alternate way
				id: "alcohol", //id required if you use accessorFn instead of accessorKey
				header: "Alcohol",
				Header: <i style={{ color: "black" }}>Alcohol</i>, //optional custom markup
				Cell: ({ cell }) => <i>{cell.getValue().toLocaleString()}</i>, //optional custom cell render
			},
			{
				accessorFn: (originalRow) => parseFloat(originalRow.age), //alternate way
				id: "age", //id required if you use accessorFn instead of accessorKey
				header: "Age",
				Header: <i style={{ color: "black" }}>Age</i>, //optional custom markup
				Cell: ({ cell }) => <i>{cell.getValue().toLocaleString()}</i>, //optional custom cell render
			},
		],
		[]
	);

	useEffect(() => {
		fetch("https://grnd.bimatrix.co.kr/django/medidata", {
			method: "GET",
		})
			.then((res) => res.json())
			.then((res) => {
				// console.log("Fetched Data: ", res.data);

				setData(res.data);
			});
	}, []);

	// //pass table options to useMaterialReactTable
	// const table = useMaterialReactTable({
	// 	columns,
	// 	data, //must be memoized or stable (useState, useMemo, defined outside of this component, etc.)
	// 	enableRowSelection: false, //enable some features
	// 	enableColumnOrdering: false, //enable a feature for all columns
	// 	enableGlobalFilter: false, //turn off a feature
	// });

	// //note: you can also pass table options as props directly to <MaterialReactTable /> instead of using useMaterialReactTable
	// //but the useMaterialReactTable hook will be the most recommended way to define table options
	// return <MaterialReactTable table={table} />;
	return <MaterialReactTable columns={columns} data={data} />;
}
