import {
	forwardRef,
	useEffect,
	useImperativeHandle,
	useLayoutEffect,
	useRef,
	useState,
} from 'react';
import styles from '../../styles/Formula.module.css';

const autoCompleteArray = [
	'IF',
	'AND',
	'OR',
	'IFERROR',
	'IFNA',
	'IFS',
	'SWITCH',
	'CHOOSE',
	'IFSERROR',
	'OR',
	'AVERAGE',
	'COUNT',
	'MAX',
	'MIN',
	'IF',
	'VLOOKUP',
	'HLOOKUP',
	'CONCATENATE',
	'SUM',
	'SUMIF',
	'DB',
	'RATE',
	'EFFECT',
	'IPMT',
	'XNPV',
	'XIRR',
	'MIRR',
	'PMT',
	'PV',
	'FV',
	'NPV',
	'IRR',
	'PMT',
	'RATE',
	'NPER',
	'XNPV',
	'XIRR',
	'CONCATENATE',
	'LEFT',
	'RIGHT',
	'MID',
	'FIND',
	'SEARCH',
	'REPLACE',
	'UPPER',
	'LOWER',
	'PROPER',
	'LEN',
	'TRIM',
	'EXACT',
	'SUBSTITUTE',
	'TEXT',
	'VALUE',
	'CONCAT',
	'DATEVALUE',
	'TIMEVALUE',
	'ISNUMBER',
];

const Formula = forwardRef(({ value, onTextChange, onBlur, ...props }, ref) => {
	const [suggestions, setSuggestions] = useState([]);
	const [activeSuggestion, setActiveSuggestion] = useState(0);
	const prevAdded = useRef('');

	const autoComplete = (e) => {
		let input = e.target.value;
		if (input[0] != '=') {
			setSuggestions([]);
			return;
		}
		//remove the '=' and split the input into an array
		let inputArray = input.slice(1).split(/[\s\*\-\+\)\/]/);
		let lastWord = inputArray[inputArray.length - 1];
		let lastWordLength = lastWord.length;
		let suggestions = [];
		if (lastWord.length > 0) {
			autoCompleteArray.forEach((word) => {
				let match = true;
				word = word.toLowerCase();
				lastWord = lastWord.toLowerCase();
				for (let i = 0; i < lastWordLength; i++) {
					if (word[i] != lastWord[i]) {
						match = false;
						break;
					}
				}
				if (match) {
					suggestions.push(word.toUpperCase());
				}
			});
			setSuggestions(suggestions);
		}
	};

	useImperativeHandle(ref, () => ({
		addLocationToFormula: (location) => {
			if (location == null || location.startX == -1 || !onTextChange) return;
			let input = document.getElementById('formula-input');
			let value = input.value;
			if (value[0] != '=' || input == document.activeElement) return;

			// prettier-ignore
			const start = String.fromCharCode(64 + location.startX) + (location.startY + 1);
			const end = String.fromCharCode(64 + location.endX) + (location.endY + 1);
			if (value.endsWith(prevAdded.current)) {
				value = value.slice(0, value.length - prevAdded.current.length);
			}

			input.value = value + start + (start == end ? '' : ':' + end);
			prevAdded.current = start + (start == end ? '' : ':' + end);

			// Update text
			onTextChange(value + start + (start == end ? '' : ':' + end));
		},
		focus: () => {
			document.getElementById('formula-input').focus();
		},
		blur: () => {
			document.getElementById('formula-input').blur();
		},
		removeSuggestions: () => {
			setSuggestions([]);
		},
		isStartWithEqual: () => {
			return value[0] == '=';
		},
	}));

	const onSuggestionClick = (suggestion) => {
		let input = value;
		let inputArray = input.slice(1).split(' ');
		inputArray[inputArray.length - 1] = suggestion;
		input = inputArray.join(' ');
		onTextChange('=' + input);
		setSuggestions([]);
	};

	const onKeyDown = (e) => {
		if (suggestions.length == 0) {
			// enter or esc
			if (e.keyCode == 13) {
				onBlur(true);
			} else if (e.keyCode == 27) {
				onBlur(false);
			}
			setSuggestions([]);
			return;
		}
		if (e.keyCode === 13) {
			//enter key
			onSuggestionClick(suggestions[activeSuggestion]);
			setActiveSuggestion(0);
			setSuggestions([]);
			e.preventDefault();
		} else if (e.keyCode === 38) {
			//up arrow
			if (activeSuggestion === 0) {
				return;
			}
			setActiveSuggestion(activeSuggestion - 1);
			e.preventDefault();
		} else if (e.keyCode === 40) {
			//down arrow
			if (activeSuggestion + 1 >= suggestions.length) {
				return;
			}
			setActiveSuggestion(activeSuggestion + 1);
			e.preventDefault();
		}
	};

	return (
		<div className={styles.FormulaHolder}>
			{/* prettier-ignore */}
			<svg xmlns="http://www.w3.org/2000/svg" width="36" height="28" viewBox="0 0 36 28" fill="none"> <path d="M15.6701 1.04114C15.6701 0.765018 15.5396 0.500189 15.3072 0.304956C15.0749 0.109633 14.7597 0 14.4311 0H13.8611C12.6896 0.00130142 11.5564 0.351265 10.6627 0.987885C9.76907 1.62439 9.17265 2.50642 8.97933 3.47739L7.80224 9.37022H5.75783C5.31515 9.37022 4.90613 9.56868 4.68476 9.89079C4.46341 10.2129 4.46341 10.6098 4.68476 10.9319C4.90611 11.254 5.31511 11.4525 5.75783 11.4525H7.38097L5.05158 23.2487C4.95388 23.7396 4.6503 24.1847 4.19575 24.5037C3.74117 24.8225 3.16567 24.9942 2.5735 24.9874H2.04072C1.59804 24.9874 1.18902 25.1859 0.967647 25.508C0.746299 25.8301 0.746299 26.227 0.967647 26.5491C1.189 26.8712 1.598 27.0697 2.04072 27.0697H2.61068C3.78221 27.0684 4.91542 26.7184 5.80908 26.0818C6.70274 25.4453 7.29916 24.5632 7.49248 23.5923L9.89621 11.4526H11.953C12.3957 11.4526 12.8047 11.2542 13.0261 10.9321C13.2474 10.6099 13.2474 10.213 13.0261 9.89092C12.8047 9.56881 12.3957 9.37036 11.953 9.37036H10.3051L11.4202 3.77932C11.5179 3.28846 11.8215 2.84327 12.2761 2.52432C12.7306 2.20549 13.3061 2.0338 13.8983 2.04063H14.4311C14.7513 2.04084 15.0591 1.93684 15.2902 1.75052C15.5212 1.5642 15.6573 1.31 15.6701 1.04114Z" fill="#DCDCDC"/> <path d="M28.7175 8.48509C28.4383 8.33825 28.1011 8.29085 27.7802 8.35343C27.4593 8.4159 27.1813 8.58313 27.0076 8.81825L24.9632 11.5668L22.9188 8.81825C22.6841 8.5021 22.2666 8.31514 21.8235 8.32772C21.3803 8.34041 20.9788 8.5507 20.7703 8.87952C20.5618 9.20836 20.5778 9.60571 20.8124 9.92185L23.5011 13.5345L20.8124 17.1471C20.6377 17.3816 20.5813 17.665 20.6557 17.9346C20.7301 18.2042 20.9291 18.4378 21.2089 18.5838C21.4881 18.7307 21.8253 18.7781 22.1462 18.7155C22.467 18.653 22.745 18.4858 22.9188 18.2507L24.9632 15.5021L27.0076 18.2507C27.1813 18.4858 27.4593 18.653 27.7802 18.7155C28.1011 18.7781 28.4383 18.7307 28.7175 18.5838C28.9973 18.4378 29.1963 18.2042 29.2706 17.9346C29.3451 17.665 29.2887 17.3816 29.114 17.1471L26.4252 13.5345L29.114 9.92185C29.2887 9.68727 29.3451 9.40389 29.2706 9.13428C29.1963 8.86467 28.9973 8.63107 28.7175 8.48509Z" fill="#DCDCDC"/> <path d="M18.8916 6.45504C18.6287 6.28933 18.2983 6.21819 17.9729 6.25723C17.6477 6.29638 17.3542 6.44236 17.157 6.66327C15.4994 8.68405 14.6118 11.0805 14.6118 13.5348C14.6118 15.9891 15.4994 18.3853 17.157 20.4063C17.391 20.6684 17.7582 20.8227 18.1482 20.8227C18.4163 20.8227 18.6771 20.7496 18.8916 20.6145C19.1546 20.4488 19.3283 20.2021 19.3749 19.9289C19.4213 19.6555 19.3367 19.3778 19.1395 19.1569C17.784 17.5032 17.0583 15.5426 17.0583 13.5348C17.0583 11.5269 17.784 9.56623 19.1395 7.91263C19.3367 7.69172 19.4213 7.41408 19.3749 7.14067C19.3283 6.86737 19.1546 6.62074 18.8916 6.45504Z" fill="#DCDCDC"/> <path d="M32.769 6.66327C32.5033 6.36568 32.069 6.20984 31.6296 6.25432C31.1901 6.29878 30.8122 6.53695 30.6383 6.879C30.4644 7.22104 30.5209 7.61507 30.7865 7.91264C32.1419 9.56629 32.8677 11.5269 32.8677 13.5348C32.8677 15.5426 32.1419 17.5033 30.7865 19.1569C30.5893 19.3778 30.5046 19.6554 30.5511 19.9289C30.5977 20.2022 30.7714 20.4488 31.0343 20.6145C31.2488 20.7496 31.5097 20.8227 31.7777 20.8227C32.1678 20.8227 32.535 20.6684 32.769 20.4063C34.4266 18.3855 35.3141 15.9891 35.3141 13.5348C35.3141 11.0805 34.4266 8.68419 32.769 6.66327Z" fill="#DCDCDC"/> </svg>
			<div className={styles.FormulaInputHolder}>
				<input
					id="formula-input"
					type="text"
					value={value}
					onChange={(e) => {
						autoComplete(e);
						onTextChange(e.target.value);
					}}
					onKeyDown={onKeyDown}
					onBlur={() => {
						setSuggestions([]);
						onBlur(false);
					}}
					{...props}
				/>
				{suggestions.length != 0 && (
					<div className={styles.FormulaSuggestions}>
						{suggestions.map((suggestion, index) => {
							return (
								<button
									className={
										index == activeSuggestion ? styles.ActiveSuggestion : ''
									}
									key={`suggestion-${index}`}
									onClick={() => onSuggestionClick(suggestion)}
								>
									{suggestion}
								</button>
							);
						})}
					</div>
				)}
			</div>
		</div>
	);
});
Formula.displayName = 'Formula';
export default Formula;
