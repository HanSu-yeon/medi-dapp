import { useState } from "react";
import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import DataView from "./pages/DataView";
import { Web3Provider } from "./utils/Web3Provider";

function App() {
	return (
		<Web3Provider>
			<BrowserRouter>
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/mydata" element={<DataView />} />
				</Routes>
			</BrowserRouter>
		</Web3Provider>
	);
}

export default App;
