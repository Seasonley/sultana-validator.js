
function ValidationResult(valid, errors) {
  return [valid, errors]
}

function Validator() {
  this.err_message = 'failed validation'
  this.not_message = 'failed validation'
}
function In() {}

function Not(validator) {
  function not(value) {
    Validator.call(this)
    this.err_message = this.err_message || 'failed validation'
    this.not_message = this.not_message || 'failed validation'
    return !validator(value)
  }
  return not
}

function Range() {}

function GreaterThan() {}

function LessThan() {}

function Equals() {}

function Blank(value) {
  Validator.call(this)
  this.err_message = 'must be an empty string'
  this.not_message = 'must not be an empty string'
  return value === ''
}

function Truthy(value) {
  Validator.call(this)
  this.err_message = 'must be True-equivalent value'
  this.not_message = 'must be False-equivalent value'
  return !!value
}

function Required(field, dictionary) {
  return field in dictionary
}

function InstanceOf() {}

function SubclassOf() {}

function Then() {}

function If() {}

function Length() {}

function Contains() {}

function Each() {}

function _validateListHelper(validation, dictionary, key, errors) {
  for (let v of validation[key]) {
    if (key in dictionary) {
      if (v instanceof Array) {
        let [, nestedErrors] = validate(v, dictionary[key])
        if (nestedErrors) {
          errors[key].append(nestedErrors)
        }
        continue
      }
      if (v !== Required) {
        if (v instanceof If) {
          let [conditional, dependent] = v(dictionary[key], dictionary)
          if (conditional && dependent[1]) {
            errors[key].push(dependent[1])
          }
        } else {
          _validateAndStoreErrs(v, dictionary, key, errors)
        }
      }
    }
  }
}


function _validateAndStoreErrs(validator, dictionary, key, errors) {
  var valid, errs
  try {
    valid = validator(dictionary[key])
  } catch (error) {
    valid = [false, validator.err_message]
  }

  if (valid instanceof Array) {
    [, errs] = valid
    if (errs && (errs instanceof Array)) {
      errors[key].push(...errs)
    } else if (errs) {
      errors[key].push(errs)
    }
  } else if (!valid) {
    errors[key].push(validator.err_message || 'failed validation')
  }
}

function validate(validation, dictionary) {
  var errors = {}
  for (let key in validation) {
    errors[key] = []
    if (validation[key] instanceof Array) {
      if (validation[key].includes(Required)) {
        if (!Required(key, dictionary)) {
          errors[key] = ['must be present']
          continue
        }
      }
      _validateListHelper(validation, dictionary, key, errors)
    } else {
      let v = validation[key]
      if (v === Required) {
        if (!Required(key, dictionary)) {
          errors[key] = ['must be present']
        }
      } else {
        _validateAndStoreErrs(v, dictionary, key, errors)
      }
    }
    if (errors[key].length === 0) {
      delete errors[key]
    }
  }
  return ValidationResult(Object.keys(errors).length === 0, errors)
}
module.exports = {
  Validator,
  In,
  Not,
  Range,
  GreaterThan,
  LessThan,
  Equals,
  Blank,
  Truthy,
  Required,
  InstanceOf,
  SubclassOf,
  Then,
  If,
  Length,
  Contains,
  Each,
  validate,
}
