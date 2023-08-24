import { useEffect, useRef, useState } from 'react';
import styles from '../../styles/Table.module.css';
import Formula from './formula';
import Cell from './Cell';
import hyperformula from 'hyperformula';
import { CellProp } from './Cell';
import BottomBar from './BottomBar';
import TopBar from './TopBar';

export default function Table() {
	const [tab, setTab] = useState(0);
	const [data, setData] = useState([]);
	const [editCell, setEditCell] = useState({
		row: -1,
		col: -1,
	});
	const formulaRef = useRef(null);
	const [editCellText, setEditCellText] = useState({
		value: '',
		firstEdit: true,
	});

	useEffect(() => {
		document.addEventListener('keyup', (e) => {
			// if escape key is pressed
			if (e.code == 'Escape') {
				setEditCell({
					row: -1,
					col: -1,
				});
				setEditCellText({
					value: '',
					firstEdit: false,
				});
				setMouseLastCell({
					row: -1,
					col: -1,
				});
				setMouseFirstCell({
					row: -1,
					col: -1,
				});
				if (formulaRef.current != null) {
					formulaRef.current.removeSuggestions();
					formulaRef.current.blur();
				}
				// setIsMouseDown(false);
			}
		});

		const header = [''];
		for (let i = 65; i <= 90; i++) {
			header.push(String.fromCharCode(i));
		}
		const data = [
			{
				name: 'sheet1',
				header,
				data: [],
			},
			{
				name: 'sheet2',
				header,
				data: [],
			},
			{
				name: 'sheet3',
				header,
				data: [],
			},
		];
		data.forEach((sheet) => {
			while (sheet.data.length < 100) {
				const emptyData = [
					new CellProp(
						sheet.data.length + 1,
						sheet.data.length + 1,
						true,
						false
					),
				];
				for (let i = 65; i <= 90; i++) {
					emptyData.push(new CellProp('', '', false, false));
				}
				sheet.data.push(emptyData);
			}
		});

		setData(data);
	}, []);

	function calculateFormulas(data) {
		const options = {
			licenseKey: 'gpl-v3',
		};

		const hfInstance = hyperformula.buildFromArray(
			data[tab].data.map((value) => {
				return value
					.map((cell) => {
						return cell.formula;
					})
					.slice(1);
			}),
			options
		);

		hfInstance.getAllSheetsValues().Sheet1.forEach((row, rowIndex) => {
			row.forEach((cell, colIndex) => {
				data[tab].data[rowIndex][colIndex + 1].value =
					cell == undefined ||
					cell == null ||
					typeof cell == 'object' ||
					cell.type == 'ERROR'
						? data[tab].data[rowIndex][colIndex + 1].formula
						: cell;
			});
		});

		setData(data);
	}

	const addSheet = () => {
		const newData = JSON.parse(JSON.stringify(data));
		const newSheet = {
			name: `sheet${newData.length + 1}`,
			header: data[0].header,
			data: [],
		};
		while (newSheet.data.length < 100) {
			const emptyData = [
				new CellProp(
					newSheet.data.length + 1,
					newSheet.data.length + 1,
					true,
					false
				),
			];
			for (let i = 65; i <= 90; i++) {
				emptyData.push(new CellProp('', '', false, false));
			}
			newSheet.data.push(emptyData);
		}
		newData.push(newSheet);
		setData(newData);
		setTab(newData.length - 1);
	};

	//#region Mouse Events
	const [isMouseDown, setIsMouseDown] = useState(false);
	const [mouseFirstCell, setMouseFirstCell] = useState({
		row: -1,
		col: -1,
	});
	const [mouseLastCell, setMouseLastCell] = useState({
		row: -1,
		col: -1,
	});

	const mouseMove = (e) => {
		if (e.buttons == 1 && isMouseDown) {
			const cell = e.target.closest('td');
			if (!cell) return;
			const row = cell.parentNode.rowIndex - 1;
			const col = cell.cellIndex;
			if (row == -1 || col == 0) return;
			if (row == mouseLastCell.row && col == mouseLastCell.col) return;

			setMouseLastCell({ row, col });
			if (formulaRef.current != null && formulaRef.current.isStartWithEqual()) {
				formulaRef.current.addLocationToFormula({
					startX: Math.min(mouseFirstCell.col, col),
					startY: Math.min(mouseFirstCell.row, row),
					endX: Math.max(mouseFirstCell.col, col),
					endY: Math.max(mouseFirstCell.row, row),
				});
			}
		}
	};

	const mouseUp = (e) => {
		if (e.buttons == 1 || e.buttons == 0) {
			const cell = e.target.closest('td');
			if (!cell) return;
			const row = cell.parentNode.rowIndex - 1;
			const col = cell.cellIndex;
			setMouseLastCell({ row, col });
			setIsMouseDown(false);
			if (formulaRef.current != null && formulaRef.current.isStartWithEqual()) {
				// formulaRef.current.addLocationToFormula({
				// 	startX: Math.min(mouseFirstCell.col, col),
				// 	startY: Math.min(mouseFirstCell.row, row),
				// 	endX: Math.max(mouseFirstCell.col, col),
				// 	endY: Math.max(mouseFirstCell.row, row),
				// });
				formulaRef.current.focus();
			}
		}
	};

	//#endregion

	return (
		<div className={styles.TableHolder}>
			<TopBar
				index={
					(editCell.row != -1 &&
						editCell.row * data[tab].header.length + editCell.col) ||
					null
				}
			/>

			<Formula
				value={editCellText.value}
				// isMouseUp={!isMouseDown || null}
				onTextChange={(_text, removeSelection = false) => {
					if (editCell.col == -1 || editCell.row == -1) return;
					// _text to upper
					const text = _text.toUpperCase();

					const newData = JSON.parse(JSON.stringify(data));
					newData[tab].data[editCell.row][editCell.col].formula = text;
					setData(newData);

					setEditCellText({
						value: text,
						firstEdit: false,
					});
				}}
				onBlur={(enter = false) => {
					if (editCell.col == -1 || editCell.row == -1) return;
					const newData = JSON.parse(JSON.stringify(data));
					calculateFormulas(newData);
					if (enter) {
						setEditCell({
							row: -1,
							col: -1,
						});
						setEditCellText({
							value: '',
							firstEdit: false,
						});
						setMouseLastCell({
							row: -1,
							col: -1,
						});
						setMouseFirstCell({
							row: -1,
							col: -1,
						});
					}
				}}
				ref={formulaRef}
			/>
			<div className={styles.TableBody}>
				<table className={styles.Table}>
					<thead>
						<tr>
							{data[tab] &&
								data[tab].header.map((header, index) => {
									return <th key={`Header-${index}`}>{header}</th>;
								})}
						</tr>
					</thead>
					<tbody onMouseMove={mouseMove} onMouseUp={mouseUp}>
						{data[tab] &&
							data[tab].data.map((row, rowIndex) => {
								return (
									<tr key={`Row-${rowIndex}`}>
										{row.map((cell, colIndex) => {
											return (
												<Cell
													isStatic={cell.isStatic}
													key={`Cell-${colIndex}`}
													cell={cell.value}
													realData={cell.formula}
													onEdit={(isEdit) => {}}
													data-active={`${
														mouseFirstCell.row == rowIndex &&
														mouseFirstCell.col == colIndex
													}`}
													data-selected={`${
														Math.max(mouseLastCell.row, mouseFirstCell.row) >=
															rowIndex &&
														Math.max(mouseLastCell.col, mouseFirstCell.col) >=
															colIndex &&
														Math.min(mouseLastCell.row, mouseFirstCell.row) <=
															rowIndex &&
														Math.min(mouseLastCell.col, mouseFirstCell.col) <=
															colIndex
													}`}
													onClick={() => {
														if (cell.isStatic) {
															setEditCell({
																row: -1,
																col: -1,
															});
															setEditCellText({
																value: '',
																firstEdit: false,
															});
															setMouseLastCell({
																row: -1,
																col: -1,
															});
															setMouseFirstCell({
																row: -1,
																col: -1,
															});
															setIsMouseDown(false);
															return;
														}

														if (isMouseDown) return;
														if (editCellText.value[0] != '=') {
															setEditCell({
																row: rowIndex,
																col: colIndex,
															});
															setEditCellText({
																value:
																	data[tab].data[rowIndex][colIndex].formula,
																firstEdit: true,
															});
														}

														setMouseFirstCell({
															row: rowIndex,
															col: colIndex,
														});
														setMouseLastCell({
															row: rowIndex,
															col: colIndex,
														});
														if (formulaRef.current != null) {
															formulaRef.current.addLocationToFormula({
																startX: colIndex,
																startY: rowIndex,
																endX: colIndex,
																endY: rowIndex,
															});
														}
														setIsMouseDown(true);
													}}
													onDoubleClick={() => {
														if (cell.isStatic) return;
														if (formulaRef.current != null) {
															formulaRef.current.addLocationToFormula({
																startX: -1,
																startY: rowIndex,
																endX: colIndex,
																endY: rowIndex,
															});
														}
														setEditCell({
															row: rowIndex,
															col: colIndex,
														});
														setEditCellText({
															value: data[tab].data[rowIndex][colIndex].formula,
															firstEdit: true,
														});
														setMouseFirstCell({
															row: rowIndex,
															col: colIndex,
														});
														setMouseLastCell({
															row: rowIndex,
															col: colIndex,
														});
													}}
													onTextChange={(text) => {
														const newData = JSON.parse(JSON.stringify(data));
														newData[tab].data[rowIndex][colIndex].formula =
															text;
														setData(newData);
														calculateFormulas(newData);
													}}
													style={cell.style}
												/>
											);
										})}
									</tr>
								);
							})}
					</tbody>
				</table>
			</div>
			<BottomBar
				tabs={data.map((sheet) => {
					return sheet.name;
				})}
				activeTab={tab}
				addSheet={addSheet}
				onTabChange={(index) => {
					setTab(index);
				}}
			/>
		</div>
	);
}
