const NUMBER_FORMATTER = new Intl.NumberFormat('en', {
  maximumFractionDigits: 20,
});

// Formats the number for display with proper formatting
function displayNumber(number) {
  const stringNumber = number?.toString() ?? '';
  if (stringNumber === '') return '';
  const [integer, decimal] = stringNumber.split('.');
  const formattedInteger = NUMBER_FORMATTER.format(integer);
  if (decimal == null) return formattedInteger;
  return `${formattedInteger}.${decimal}`;
}

export default class Calculator {
  #primaryOperandDisplay;
  #secondaryOperandDisplay;
  #operationDisplay;

  constructor(
    primaryOperandDisplay,
    secondaryOperandDisplay,
    operationDisplay
  ) {
    this.#primaryOperandDisplay = primaryOperandDisplay;
    this.#secondaryOperandDisplay = secondaryOperandDisplay;
    this.#operationDisplay = operationDisplay;
    this.clear();

    // Add event listeners for keyboard input
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
  }

  // Handle keyboard input
  handleKeyDown(event) {
    const { key } = event;
    if (/^[0-9.]$/.test(key)) {
      event.preventDefault();
      this.appendNumber(key);
    } else if (key === 'Backspace') {
      event.preventDefault();
      this.deleteNumber();
    } else if (/^[*\/+-]$/.test(key)) {
      event.preventDefault();
      let operation = key;
      if (operation === '*') operation = '×';
      if (operation === '/') operation = '÷';
      this.chooseOperation(operation);
    } else if (key === 'Enter') {
      event.preventDefault();
      this.evaluate();
    } else if (key === 'Escape') {
      event.preventDefault();
      this.clear();
    }
  }

  get primaryOperand() {
    return parseFloat(this.#primaryOperandDisplay.dataset.value);
  }

  set primaryOperand(number) {
    this.#primaryOperandDisplay.dataset.value = number ?? '';
    this.#primaryOperandDisplay.textContent = displayNumber(number);
  }

  get secondaryOperand() {
    return parseFloat(this.#secondaryOperandDisplay.dataset.value);
  }

  set secondaryOperand(number) {
    this.#secondaryOperandDisplay.dataset.value = number ?? '';
    this.#secondaryOperandDisplay.textContent = displayNumber(number);
  }

  get operation() {
    return this.#operationDisplay.textContent;
  }

  set operation(operation) {
    this.#operationDisplay.textContent = operation ?? '';
  }

  // Appends a number to the primary operand
  appendNumber(number) {
    if (
      number === '.' &&
      this.#primaryOperandDisplay.dataset.value.includes('.')
    )
      return;
    this.primaryOperand =
      this.#primaryOperandDisplay.dataset.value === '0' && number !== '.'
        ? number
        : this.#primaryOperandDisplay.dataset.value + number;
  }

  // Deletes the last digit of the primary operand
  deleteNumber() {
    const stringNumber = this.#primaryOperandDisplay.dataset.value;
    if (stringNumber.length <= 1) {
      this.primaryOperand = 0;
      return;
    }
    this.primaryOperand = stringNumber.slice(0, -1);
  }

  // Performs the specified arithmetic operation between the primary and secondary operands
  performOperation(primary, secondary, operation) {
    let result;
    switch (operation) {
      case '+':
        result = secondary + primary;
        break;
      case '-':
        result = secondary - primary;
        break;
      case '×':
        result = secondary * primary;
        break;
      case '÷':
        result = secondary / primary;
        break;
      default:
        return;
    }
    return Math.round(result * 1e12) / 1e12; // Round to deal with JavaScript float precision issue
  }

  // Evaluates the expression and returns the result
  evaluate() {
    const result = this.performOperation(
      this.primaryOperand,
      this.secondaryOperand,
      this.operation
    );

    if (result !== undefined) {
      this.clear();
      this.primaryOperand = result;
    }

    return result;
  }

  // Sets the operation and prepares for a new primary operand
  chooseOperation(operation) {
    if (this.operation !== '') return;
    this.operation = operation;
    this.secondaryOperand = this.primaryOperand;
    this.primaryOperand = 0;
  }

  // Clears all operands and operation
  clear() {
    this.primaryOperand = 0;
    this.secondaryOperand = null;
    this.operation = null;
  }
}
