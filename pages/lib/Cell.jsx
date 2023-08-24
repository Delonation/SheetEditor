import React, { useRef, useState } from 'react';
import styles from '../../styles/Cell.module.css';

export default function Cell({
	cell,
	isStatic,
	onTextChange,
	onEdit,
	onClick,
	realData,
	style,
	onDoubleClick,
	...props
}) {
	const [isEditing, setIsEditing] = useState(false);
	return (
		<td
			className={styles.cellHolder}
			data-active={props['data-active'] || 'true'}
			data-selected={props['data-selected'] || 'true'}
			onMouseDown={(e) => {
				onClick(e);
			}}
			onDoubleClick={(e) => {
				if (isStatic) return;
				onDoubleClick(e);
				setIsEditing(true);
				onEdit(true);
			}}
		>
			{!isEditing && (
				<span className={styles.Cell} style={style}>
					{cell}
				</span>
			)}
			{isEditing && (
				<input
					className={styles.Cell}
					style={style}
					type="text"
					value={realData}
					onChange={(e) => {
						onTextChange(e.target.value);
					}}
					onBlur={() => {
						setIsEditing(false);
						onEdit(false);
					}}
					autoFocus
				/>
			)}
		</td>
	);
}

export class CellProp {
	value = '';
	formula = '';
	isStatic = false;
	isHighlighted = false;
	style = {
		fontSize: 14,
		fontFamily: 'Arial',
		color: '#000000',
	};
	ref;

	constructor(value, formula, isStatic, isHighlighted) {
		this.value = value;
		this.formula = formula;
		this.isStatic = isStatic;
		this.isHighlighted = isHighlighted;
	}
}
