import React, { useState } from 'react';
import styles from '../../styles/bottombar.module.css';

export default function BottomBar({ tabs, activeTab, onTabChange, ...props }) {
	return (
		<div className={styles.bottombar}>
			<button onClick={props.addSheet}>add</button>
			{tabs &&
				tabs.map((tab, index) => {
					return (
						<Tab
							key={`tab ${index}`}
							name={tab}
							index={index}
							active={index == activeTab}
							onTabChange={onTabChange}
						/>
					);
				})}
		</div>
	);
}

function Tab({ name, active, index, onClick, onTabChange }) {
	const [isEdit, setIsEdit] = useState(false);
	const [tabName, setTabName] = useState(name);
	return (
		<label
			onDoubleClick={() => {
				setIsEdit(true);
			}}
			className={styles.tab}
			data-active={`${active}`}
		>
			<input
				type="radio"
				name="tab-group"
				defaultChecked={active}
				onChange={() => {
					onTabChange(index);
				}}
			/>
			<span>{tabName}</span>
			{isEdit && (
				<input
					type="text"
					value={tabName}
					autoFocus
					onBlur={() => {
						setIsEdit(false);
					}}
					onKeyDown={(e) => {
						if (e.code == 'Enter') {
							setIsEdit(false);
							return;
						}
					}}
					onChange={(e) => {
						setTabName(e.target.value);
					}}
				/>
			)}
		</label>
	);
}
