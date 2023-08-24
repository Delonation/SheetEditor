import React, { useEffect, useState } from 'react';
import styles from '../../styles/topbar.module.css';

export default function TopBar({ index, ...props }) {
	const fonts = [
		'Arial',
		'Arial Black',
		'Arial Narrow',
		'Arial Rounded MT Bold',
		'Avant Garde',
		'Calibri',
		'Candara',
	];
	const [cell, setCell] = useState(null);
	const [style, setStyle] = useState({
		fontSize: 14,
		fontFamily: 'Arial',
		color: '#000000',
	});

	useEffect(() => {
		if (typeof document !== 'undefined' && index) {
			const cell = document.querySelectorAll(`td > span`)[index];
			setStyle({
				fontSize: cell.style['fontSize']?.replace('px', '') || 14,
				fontFamily: cell.style['fontFamily'] || 'Arial',
				color: cell.style['color'] || '#000000',
			});
			setCell(cell);
		}
	}, [index]);

	const onStyleChange = (style, value, styleValue) => {
		if (!cell) return;
		cell.style[style] = value;
		setStyle((prev) => ({
			...prev,
			[style]: styleValue,
		}));
	};

	return (
		<div className={styles.topbar}>
			<div>
				<span>Font size: </span>
				<input
					type="number"
					min="8"
					max="72"
					value={style.fontSize}
					onChange={(e) => {
						onStyleChange('fontSize', `${e.target.value}px`, e.target.value);
					}}
				/>
			</div>
			<div>
				<span>Font Family: </span>
				{/* dropdown for fonts family */}
				<select
					value={style.fontFamily}
					onChange={(e) => {
						onStyleChange('fontFamily', e.target.value, e.target.value);
					}}
				>
					{fonts.map((font, index) => {
						return (
							<option key={`fontfamily-${index}`} value={font}>
								{font}
							</option>
						);
					})}
				</select>
			</div>
			<div>
				<span>color: </span>
				<input
					type="color"
					value={style.color}
					onChange={(e) => {
						onStyleChange('color', e.target.value, e.target.value);
					}}
				/>
			</div>
		</div>
	);
}
