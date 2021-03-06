function BranchData() {
    this.position = -1;
    this.nodeLength = -1;
    this.src = null;
    this.evalFalse = 0;
    this.evalTrue = 0;

    this.init = function(position, nodeLength, src) {
        this.position = position;
        this.nodeLength = nodeLength;
        this.src = src;
        return this;
    }

    this.ranCondition = function(result) {
        if (result)
            this.evalTrue++;
        else
            this.evalFalse++;
    };

    this.pathsCovered = function() {
        var paths = 0;
        if (this.evalTrue > 0)
          paths++;
        if (this.evalFalse > 0)
          paths++;
        return paths;
    };

    this.covered = function() {
        return this.evalTrue > 0 && this.evalFalse > 0;
    };

    this.toJSON = function() {
        return '{"position":' + this.position
            + ',"nodeLength":' + this.nodeLength
            + ',"src":' + jscoverage_quote(this.src)
            + ',"evalFalse":' + this.evalFalse
            + ',"evalTrue":' + this.evalTrue + '}';
    };

    this.message = function() {
        if (this.evalTrue === 0 && this.evalFalse === 0)
            return 'Condition never evaluated         :\t' + this.src;
        else if (this.evalTrue === 0)
            return 'Condition never evaluated to true :\t' + this.src;
        else if (this.evalFalse === 0)
            return 'Condition never evaluated to false:\t' + this.src;
        else
            return 'Condition covered';
    };
}

BranchData.fromJson = function(jsonString) {
    var json = eval('(' + jsonString + ')');
    var branchData = new BranchData();
    branchData.init(json.position, json.nodeLength, json.src);
    branchData.evalFalse = json.evalFalse;
    branchData.evalTrue = json.evalTrue;
    return branchData;
};

BranchData.fromJsonObject = function(json) {
    var branchData = new BranchData();
    branchData.init(json.position, json.nodeLength, json.src);
    branchData.evalFalse = json.evalFalse;
    branchData.evalTrue = json.evalTrue;
    return branchData;
};

function buildBranchMessage(conditions) {
    var message = 'The following was not covered:';
    for (var i = 0; i < conditions.length; i++) {
        if (conditions[i] !== undefined && conditions[i] !== null && !conditions[i].covered())
          message += '\n- '+ conditions[i].message();
    }
    return message;
};

function convertBranchDataConditionArrayToJSON(branchDataConditionArray) {
    var array = [];
    var length = branchDataConditionArray.length;
    for (var condition = 0; condition < length; condition++) {
        var branchDataObject = branchDataConditionArray[condition];
        if (branchDataObject === undefined || branchDataObject === null) {
            value = 'null';
        } else {
            value = branchDataObject.toJSON();
        }
        array.push(value);
    }
    return '[' + array.join(',') + ']';
}

function convertBranchDataLinesToJSON(branchData) {
    if (branchData === undefined) {
        return '{}'
    }
    var json = '';
    for (var line in branchData) {
        if (json !== '')
            json += ','
        json += '"' + line + '":' + convertBranchDataConditionArrayToJSON(branchData[line]);
    }
    return '{' + json + '}';
}

function convertBranchDataLinesFromJSON(jsonObject) {
    if (jsonObject === undefined) {
        return {};
    }
    for (var line in jsonObject) {
        var branchDataJSON = jsonObject[line];
        if (branchDataJSON !== null) {
            for (var conditionIndex = 0; conditionIndex < branchDataJSON.length; conditionIndex ++) {
                var condition = branchDataJSON[conditionIndex];
                if (condition !== null) {
                    branchDataJSON[conditionIndex] = BranchData.fromJsonObject(condition);
                }
            }
        }
    }
    return jsonObject;
}
function jscoverage_quote(s) {
    return '"' + s.replace(/[\u0000-\u001f"\\\u007f-\uffff]/g, function (c) {
        switch (c) {
            case '\b':
                return '\\b';
            case '\f':
                return '\\f';
            case '\n':
                return '\\n';
            case '\r':
                return '\\r';
            case '\t':
                return '\\t';
            // IE doesn't support this
            /*
             case '\v':
             return '\\v';
             */
            case '"':
                return '\\"';
            case '\\':
                return '\\\\';
            default:
                return '\\u' + jscoverage_pad(c.charCodeAt(0).toString(16));
        }
    }) + '"';
}

function getArrayJSON(coverage) {
    var array = [];
    if (coverage === undefined)
        return array;

    var length = coverage.length;
    for (var line = 0; line < length; line++) {
        var value = coverage[line];
        if (value === undefined || value === null) {
            value = 'null';
        }
        array.push(value);
    }
    return array;
}

function jscoverage_serializeCoverageToJSON() {
    var json = [];
    for (var file in _$jscoverage) {
        var lineArray = getArrayJSON(_$jscoverage[file].lineData);
        var fnArray = getArrayJSON(_$jscoverage[file].functionData);

        json.push(jscoverage_quote(file) + ':{"lineData":[' + lineArray.join(',') + '],"functionData":[' + fnArray.join(',') + '],"branchData":' + convertBranchDataLinesToJSON(_$jscoverage[file].branchData) + '}');
    }
    return '{' + json.join(',') + '}';
}


function jscoverage_pad(s) {
    return '0000'.substr(s.length) + s;
}

function jscoverage_html_escape(s) {
    return s.replace(/[<>\&\"\']/g, function (c) {
        return '&#' + c.charCodeAt(0) + ';';
    });
}
try {
  if (typeof top === 'object' && top !== null && typeof top.opener === 'object' && top.opener !== null) {
    // this is a browser window that was opened from another window

    if (! top.opener._$jscoverage) {
      top.opener._$jscoverage = {};
    }
  }
}
catch (e) {}

try {
  if (typeof top === 'object' && top !== null) {
    // this is a browser window

    try {
      if (typeof top.opener === 'object' && top.opener !== null && top.opener._$jscoverage) {
        top._$jscoverage = top.opener._$jscoverage;
      }
    }
    catch (e) {}

    if (! top._$jscoverage) {
      top._$jscoverage = {};
    }
  }
}
catch (e) {}

try {
  if (typeof top === 'object' && top !== null && top._$jscoverage) {
    this._$jscoverage = top._$jscoverage;
  }
}
catch (e) {}
if (! this._$jscoverage) {
  this._$jscoverage = {};
}
if (! _$jscoverage['/html-parser/writer/minify.js']) {
  _$jscoverage['/html-parser/writer/minify.js'] = {};
  _$jscoverage['/html-parser/writer/minify.js'].lineData = [];
  _$jscoverage['/html-parser/writer/minify.js'].lineData[6] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[7] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[15] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[16] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[19] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[20] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[22] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[23] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[26] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[30] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[33] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[36] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[37] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[40] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[41] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[68] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[69] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[72] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[73] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[76] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[77] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[91] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[92] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[103] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[104] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[107] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[108] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[112] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[113] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[115] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[117] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[119] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[120] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[122] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[125] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[126] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[131] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[132] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[144] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[145] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[146] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[147] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[150] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[155] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[156] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[157] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[165] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[166] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[167] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[169] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[176] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[177] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[178] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[180] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[187] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[188] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[192] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[198] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[201] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[204] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[206] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[207] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[211] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[213] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[216] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[219] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[226] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[227] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[229] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[231] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[235] = 0;
}
if (! _$jscoverage['/html-parser/writer/minify.js'].functionData) {
  _$jscoverage['/html-parser/writer/minify.js'].functionData = [];
  _$jscoverage['/html-parser/writer/minify.js'].functionData[0] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].functionData[1] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].functionData[2] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].functionData[3] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].functionData[4] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].functionData[5] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].functionData[6] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].functionData[7] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].functionData[8] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].functionData[9] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].functionData[10] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].functionData[11] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].functionData[12] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].functionData[13] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].functionData[14] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].functionData[15] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].functionData[16] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].functionData[17] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].functionData[18] = 0;
}
if (! _$jscoverage['/html-parser/writer/minify.js'].branchData) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData = {};
  _$jscoverage['/html-parser/writer/minify.js'].branchData['20'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['20'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['22'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['22'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['23'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['23'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['23'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['23'][3] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['23'][4] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['39'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['39'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['42'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['42'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['42'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['42'][3] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['43'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['43'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['44'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['44'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['46'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['46'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['46'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['46'][3] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['47'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['47'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['47'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['48'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['48'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['50'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['50'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['50'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['50'][3] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['51'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['51'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['51'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['52'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['52'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['54'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['54'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['54'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['54'][3] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['55'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['55'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['55'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['56'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['56'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['58'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['58'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['58'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['58'][3] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['59'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['59'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['59'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['60'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['60'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['62'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['62'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['62'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['63'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['63'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['63'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['64'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['64'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['78'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['78'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['78'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['78'][3] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['79'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['79'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['79'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['79'][3] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['80'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['80'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['80'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['80'][3] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['81'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['81'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['81'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['81'][3] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['81'][4] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['82'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['82'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['82'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['82'][3] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['82'][4] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['83'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['83'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['83'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['83'][3] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['83'][4] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['83'][5] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['83'][6] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['84'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['84'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['84'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['84'][3] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['84'][4] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['85'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['85'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['85'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['85'][3] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['85'][4] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['85'][5] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['85'][6] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['86'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['86'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['86'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['86'][3] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['86'][4] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['87'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['87'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['87'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['87'][3] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['87'][4] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['87'][5] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['93'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['93'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['93'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['93'][3] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['94'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['94'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['94'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['94'][3] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['94'][4] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['94'][5] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['94'][6] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['95'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['95'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['95'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['95'][3] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['95'][4] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['95'][5] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['95'][6] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['96'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['96'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['96'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['96'][3] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['97'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['97'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['97'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['97'][3] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['97'][4] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['98'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['98'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['98'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['98'][3] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['98'][4] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['99'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['99'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['99'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['99'][3] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['99'][4] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['99'][5] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['99'][6] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['99'][7] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['106'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['106'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['107'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['107'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['112'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['112'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['115'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['115'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['119'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['119'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['155'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['155'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['166'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['166'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['177'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['177'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['195'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['195'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['198'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['198'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['204'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['204'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['213'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['213'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['227'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['227'][1] = new BranchData();
}
_$jscoverage['/html-parser/writer/minify.js'].branchData['227'][1].init(48, 11, '!self.inPre');
function visit534_227_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['227'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['213'][1].init(690, 40, 'value && canRemoveAttributeQuotes(value)');
function visit533_213_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['213'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['204'][1].init(395, 24, 'isBooleanAttribute(name)');
function visit532_204_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['204'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['198'][1].init(201, 131, 'canDeleteEmptyAttribute(el, attr) || isAttributeRedundant(el, attr)');
function visit531_198_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['198'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['195'][1].init(110, 16, 'attr.value || ""');
function visit530_195_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['195'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['177'][1].init(48, 19, 'el.tagName == \'pre\'');
function visit529_177_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['177'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['166'][1].init(48, 19, 'el.tagName == \'pre\'');
function visit528_166_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['166'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['155'][1].init(18, 26, 'isConditionalComment(text)');
function visit527_155_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['155'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['119'][1].init(605, 20, 'attrName === \'style\'');
function visit526_119_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['119'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['115'][1].init(443, 86, 'isUriTypeAttribute(attrName, tag) || isNumberTypeAttribute(attrName, tag)');
function visit525_115_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['115'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['112'][1].init(327, 20, 'attrName === \'class\'');
function visit524_112_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['112'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['107'][1].init(124, 26, 'isEventAttribute(attrName)');
function visit523_107_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['107'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['106'][1].init(82, 16, 'attr.value || ""');
function visit522_106_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['106'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['99'][7].init(118, 22, 'attrName === \'colspan\'');
function visit521_99_7(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['99'][7].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['99'][6].init(92, 22, 'attrName === \'rowspan\'');
function visit520_99_6(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['99'][6].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['99'][5].init(92, 48, 'attrName === \'rowspan\' || attrName === \'colspan\'');
function visit519_99_5(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['99'][5].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['99'][4].init(75, 11, 'tag == \'td\'');
function visit518_99_4(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['99'][4].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['99'][3].init(59, 12, 'tag === \'th\'');
function visit517_99_3(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['99'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['99'][2].init(59, 27, 'tag === \'th\' || tag == \'td\'');
function visit516_99_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['99'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['99'][1].init(59, 82, '(tag === \'th\' || tag == \'td\') && (attrName === \'rowspan\' || attrName === \'colspan\')');
function visit515_99_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['99'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['98'][4].init(473, 19, 'attrName === \'span\'');
function visit514_98_4(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['98'][4].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['98'][3].init(456, 13, 'tag === \'col\'');
function visit513_98_3(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['98'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['98'][2].init(456, 36, 'tag === \'col\' && attrName === \'span\'');
function visit512_98_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['98'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['98'][1].init(63, 143, '(tag === \'col\' && attrName === \'span\') || ((tag === \'th\' || tag == \'td\') && (attrName === \'rowspan\' || attrName === \'colspan\'))');
function visit511_98_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['98'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['97'][4].init(413, 19, 'attrName === \'span\'');
function visit510_97_4(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['97'][4].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['97'][3].init(391, 18, 'tag === \'colgroup\'');
function visit509_97_3(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['97'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['97'][2].init(391, 41, 'tag === \'colgroup\' && attrName === \'span\'');
function visit508_97_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['97'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['97'][1].init(87, 207, '(tag === \'colgroup\' && attrName === \'span\') || (tag === \'col\' && attrName === \'span\') || ((tag === \'th\' || tag == \'td\') && (attrName === \'rowspan\' || attrName === \'colspan\'))');
function visit507_97_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['97'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['96'][3].init(302, 18, 'tag === \'textarea\'');
function visit506_96_3(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['96'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['96'][2].init(302, 65, 'tag === \'textarea\' && (/^(?:rows|cols|tabindex)$/).test(attrName)');
function visit505_96_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['96'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['96'][1].init(90, 295, '(tag === \'textarea\' && (/^(?:rows|cols|tabindex)$/).test(attrName)) || (tag === \'colgroup\' && attrName === \'span\') || (tag === \'col\' && attrName === \'span\') || ((tag === \'th\' || tag == \'td\') && (attrName === \'rowspan\' || attrName === \'colspan\'))');
function visit504_96_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['96'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['95'][6].init(254, 23, 'attrName === \'tabindex\'');
function visit503_95_6(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['95'][6].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['95'][5].init(231, 19, 'attrName === \'size\'');
function visit502_95_5(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['95'][5].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['95'][4].init(231, 46, 'attrName === \'size\' || attrName === \'tabindex\'');
function visit501_95_4(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['95'][4].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['95'][3].init(210, 16, 'tag === \'select\'');
function visit500_95_3(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['95'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['95'][2].init(210, 68, 'tag === \'select\' && (attrName === \'size\' || attrName === \'tabindex\')');
function visit499_95_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['95'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['95'][1].init(94, 386, '(tag === \'select\' && (attrName === \'size\' || attrName === \'tabindex\')) || (tag === \'textarea\' && (/^(?:rows|cols|tabindex)$/).test(attrName)) || (tag === \'colgroup\' && attrName === \'span\') || (tag === \'col\' && attrName === \'span\') || ((tag === \'th\' || tag == \'td\') && (attrName === \'rowspan\' || attrName === \'colspan\'))');
function visit498_95_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['95'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['94'][6].init(162, 23, 'attrName === \'tabindex\'');
function visit497_94_6(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['94'][6].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['94'][5].init(134, 24, 'attrName === \'maxlength\'');
function visit496_94_5(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['94'][5].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['94'][4].init(134, 51, 'attrName === \'maxlength\' || attrName === \'tabindex\'');
function visit495_94_4(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['94'][4].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['94'][3].init(114, 15, 'tag === \'input\'');
function visit494_94_3(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['94'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['94'][2].init(114, 72, 'tag === \'input\' && (attrName === \'maxlength\' || attrName === \'tabindex\')');
function visit493_94_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['94'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['94'][1].init(88, 481, '(tag === \'input\' && (attrName === \'maxlength\' || attrName === \'tabindex\')) || (tag === \'select\' && (attrName === \'size\' || attrName === \'tabindex\')) || (tag === \'textarea\' && (/^(?:rows|cols|tabindex)$/).test(attrName)) || (tag === \'colgroup\' && attrName === \'span\') || (tag === \'col\' && attrName === \'span\') || ((tag === \'th\' || tag == \'td\') && (attrName === \'rowspan\' || attrName === \'colspan\'))');
function visit492_94_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['94'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['93'][3].init(67, 23, 'attrName === \'tabindex\'');
function visit491_93_3(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['93'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['93'][2].init(24, 66, '(/^(?:a|area|object|button)$/).test(tag) && attrName === \'tabindex\'');
function visit490_93_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['93'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['93'][1].init(-1, 570, '((/^(?:a|area|object|button)$/).test(tag) && attrName === \'tabindex\') || (tag === \'input\' && (attrName === \'maxlength\' || attrName === \'tabindex\')) || (tag === \'select\' && (attrName === \'size\' || attrName === \'tabindex\')) || (tag === \'textarea\' && (/^(?:rows|cols|tabindex)$/).test(attrName)) || (tag === \'colgroup\' && attrName === \'span\') || (tag === \'col\' && attrName === \'span\') || ((tag === \'th\' || tag == \'td\') && (attrName === \'rowspan\' || attrName === \'colspan\'))');
function visit489_93_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['93'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['87'][5].init(105, 18, 'attrName === \'for\'');
function visit488_87_5(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['87'][5].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['87'][4].init(83, 18, 'attrName === \'src\'');
function visit487_87_4(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['87'][4].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['87'][3].init(83, 40, 'attrName === \'src\' || attrName === \'for\'');
function visit486_87_3(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['87'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['87'][2].init(62, 16, 'tag === \'script\'');
function visit485_87_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['87'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['87'][1].init(62, 62, 'tag === \'script\' && (attrName === \'src\' || attrName === \'for\')');
function visit484_87_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['87'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['86'][4].init(661, 22, 'attrName === \'profile\'');
function visit483_86_4(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['86'][4].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['86'][3].init(643, 14, 'tag === \'head\'');
function visit482_86_3(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['86'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['86'][2].init(643, 40, 'tag === \'head\' && attrName === \'profile\'');
function visit481_86_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['86'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['86'][1].init(86, 126, '(tag === \'head\' && attrName === \'profile\') || (tag === \'script\' && (attrName === \'src\' || attrName === \'for\'))');
function visit480_86_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['86'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['85'][6].init(597, 21, 'attrName === \'usemap\'');
function visit479_85_6(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['85'][6].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['85'][5].init(575, 18, 'attrName === \'src\'');
function visit478_85_5(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['85'][5].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['85'][4].init(575, 43, 'attrName === \'src\' || attrName === \'usemap\'');
function visit477_85_4(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['85'][4].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['85'][3].init(555, 15, 'tag === \'input\'');
function visit476_85_3(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['85'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['85'][2].init(555, 64, 'tag === \'input\' && (attrName === \'src\' || attrName === \'usemap\')');
function visit475_85_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['85'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['85'][1].init(61, 213, '(tag === \'input\' && (attrName === \'src\' || attrName === \'usemap\')) || (tag === \'head\' && attrName === \'profile\') || (tag === \'script\' && (attrName === \'src\' || attrName === \'for\'))');
function visit474_85_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['85'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['84'][4].init(510, 21, 'attrName === \'action\'');
function visit473_84_4(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['84'][4].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['84'][3].init(492, 14, 'tag === \'form\'');
function visit472_84_3(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['84'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['84'][2].init(492, 39, 'tag === \'form\' && attrName === \'action\'');
function visit471_84_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['84'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['84'][1].init(76, 275, '(tag === \'form\' && attrName === \'action\') || (tag === \'input\' && (attrName === \'src\' || attrName === \'usemap\')) || (tag === \'head\' && attrName === \'profile\') || (tag === \'script\' && (attrName === \'src\' || attrName === \'for\'))');
function visit470_84_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['84'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['83'][6].init(449, 19, 'attrName === \'cite\'');
function visit469_83_6(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['83'][6].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['83'][5].init(431, 13, 'tag === \'del\'');
function visit468_83_5(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['83'][5].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['83'][4].init(414, 13, 'tag === \'ins\'');
function visit467_83_4(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['83'][4].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['83'][3].init(414, 30, 'tag === \'ins\' || tag === \'del\'');
function visit466_83_3(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['83'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['83'][2].init(414, 54, '(tag === \'ins\' || tag === \'del\') && attrName === \'cite\'');
function visit465_83_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['83'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['83'][1].init(66, 352, '((tag === \'ins\' || tag === \'del\') && attrName === \'cite\') || (tag === \'form\' && attrName === \'action\') || (tag === \'input\' && (attrName === \'src\' || attrName === \'usemap\')) || (tag === \'head\' && attrName === \'profile\') || (tag === \'script\' && (attrName === \'src\' || attrName === \'for\'))');
function visit464_83_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['83'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['82'][4].init(370, 19, 'attrName === \'cite\'');
function visit463_82_4(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['82'][4].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['82'][3].init(346, 20, 'tag === \'blockquote\'');
function visit462_82_3(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['82'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['82'][2].init(346, 43, 'tag === \'blockquote\' && attrName === \'cite\'');
function visit461_82_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['82'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['82'][1].init(56, 419, '(tag === \'blockquote\' && attrName === \'cite\') || ((tag === \'ins\' || tag === \'del\') && attrName === \'cite\') || (tag === \'form\' && attrName === \'action\') || (tag === \'input\' && (attrName === \'src\' || attrName === \'usemap\')) || (tag === \'head\' && attrName === \'profile\') || (tag === \'script\' && (attrName === \'src\' || attrName === \'for\'))');
function visit460_82_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['82'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['81'][4].init(303, 19, 'attrName === \'cite\'');
function visit459_81_4(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['81'][4].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['81'][3].init(288, 11, 'tag === \'q\'');
function visit458_81_3(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['81'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['81'][2].init(288, 34, 'tag === \'q\' && attrName === \'cite\'');
function visit457_81_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['81'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['81'][1].init(95, 476, '(tag === \'q\' && attrName === \'cite\') || (tag === \'blockquote\' && attrName === \'cite\') || ((tag === \'ins\' || tag === \'del\') && attrName === \'cite\') || (tag === \'form\' && attrName === \'action\') || (tag === \'input\' && (attrName === \'src\' || attrName === \'usemap\')) || (tag === \'head\' && attrName === \'profile\') || (tag === \'script\' && (attrName === \'src\' || attrName === \'for\'))');
function visit456_81_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['81'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['80'][3].init(191, 16, 'tag === \'object\'');
function visit455_80_3(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['80'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['80'][2].init(191, 73, 'tag === \'object\' && (/^(?:classid|codebase|data|usemap)$/).test(attrName)');
function visit454_80_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['80'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['80'][1].init(83, 572, '(tag === \'object\' && (/^(?:classid|codebase|data|usemap)$/).test(attrName)) || (tag === \'q\' && attrName === \'cite\') || (tag === \'blockquote\' && attrName === \'cite\') || ((tag === \'ins\' || tag === \'del\') && attrName === \'cite\') || (tag === \'form\' && attrName === \'action\') || (tag === \'input\' && (attrName === \'src\' || attrName === \'usemap\')) || (tag === \'head\' && attrName === \'profile\') || (tag === \'script\' && (attrName === \'src\' || attrName === \'for\'))');
function visit453_80_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['80'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['79'][3].init(106, 13, 'tag === \'img\'');
function visit452_79_3(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['79'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['79'][2].init(106, 61, 'tag === \'img\' && (/^(?:src|longdesc|usemap)$/).test(attrName)');
function visit451_79_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['79'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['79'][1].init(80, 656, '(tag === \'img\' && (/^(?:src|longdesc|usemap)$/).test(attrName)) || (tag === \'object\' && (/^(?:classid|codebase|data|usemap)$/).test(attrName)) || (tag === \'q\' && attrName === \'cite\') || (tag === \'blockquote\' && attrName === \'cite\') || ((tag === \'ins\' || tag === \'del\') && attrName === \'cite\') || (tag === \'form\' && attrName === \'action\') || (tag === \'input\' && (attrName === \'src\' || attrName === \'usemap\')) || (tag === \'head\' && attrName === \'profile\') || (tag === \'script\' && (attrName === \'src\' || attrName === \'for\'))');
function visit450_79_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['79'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['78'][3].init(63, 19, 'attrName === \'href\'');
function visit449_78_3(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['78'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['78'][2].init(24, 58, '(/^(?:a|area|link|base)$/).test(tag) && attrName === \'href\'');
function visit448_78_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['78'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['78'][1].init(-1, 737, '((/^(?:a|area|link|base)$/).test(tag) && attrName === \'href\') || (tag === \'img\' && (/^(?:src|longdesc|usemap)$/).test(attrName)) || (tag === \'object\' && (/^(?:classid|codebase|data|usemap)$/).test(attrName)) || (tag === \'q\' && attrName === \'cite\') || (tag === \'blockquote\' && attrName === \'cite\') || ((tag === \'ins\' || tag === \'del\') && attrName === \'cite\') || (tag === \'form\' && attrName === \'action\') || (tag === \'input\' && (attrName === \'src\' || attrName === \'usemap\')) || (tag === \'head\' && attrName === \'profile\') || (tag === \'script\' && (attrName === \'src\' || attrName === \'for\'))');
function visit447_78_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['78'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['64'][1].init(44, 20, 'attrValue === \'rect\'');
function visit446_64_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['64'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['63'][2].init(173, 20, 'attrName === \'shape\'');
function visit445_63_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['63'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['63'][1].init(38, 65, 'attrName === \'shape\' && attrValue === \'rect\'');
function visit444_63_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['63'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['62'][2].init(132, 14, 'tag === \'area\'');
function visit443_62_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['62'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['62'][1].init(132, 104, 'tag === \'area\' && attrName === \'shape\' && attrValue === \'rect\'');
function visit442_62_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['62'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['60'][1].init(43, 24, 'attrValue === \'text/css\'');
function visit441_60_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['60'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['59'][2].init(41, 19, 'attrName === \'type\'');
function visit440_59_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['59'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['59'][1].init(39, 68, 'attrName === \'type\' && attrValue === \'text/css\'');
function visit439_59_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['59'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['58'][3].init(558, 15, 'tag === \'style\'');
function visit438_58_3(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['58'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['58'][2].init(558, 108, 'tag === \'style\' && attrName === \'type\' && attrValue === \'text/css\'');
function visit437_58_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['58'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['58'][1].init(140, 238, '(tag === \'style\' && attrName === \'type\' && attrValue === \'text/css\') || (tag === \'area\' && attrName === \'shape\' && attrValue === \'rect\')');
function visit436_58_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['58'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['56'][1].init(43, 31, 'attrValue === \'text/javascript\'');
function visit435_56_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['56'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['55'][2].init(42, 19, 'attrName === \'type\'');
function visit434_55_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['55'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['55'][1].init(40, 75, 'attrName === \'type\' && attrValue === \'text/javascript\'');
function visit433_55_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['55'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['54'][3].init(416, 16, 'tag === \'script\'');
function visit432_54_3(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['54'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['54'][2].init(416, 116, 'tag === \'script\' && attrName === \'type\' && attrValue === \'text/javascript\'');
function visit431_54_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['54'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['54'][1].init(128, 379, '(tag === \'script\' && attrName === \'type\' && attrValue === \'text/javascript\') || (tag === \'style\' && attrName === \'type\' && attrValue === \'text/css\') || (tag === \'area\' && attrName === \'shape\' && attrValue === \'rect\')');
function visit430_54_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['54'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['52'][1].init(43, 20, 'attrValue === \'text\'');
function visit429_52_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['52'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['51'][2].init(41, 19, 'attrName === \'type\'');
function visit428_51_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['51'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['51'][1].init(39, 64, 'attrName === \'type\' && attrValue === \'text\'');
function visit427_51_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['51'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['50'][3].init(286, 15, 'tag === \'input\'');
function visit426_50_3(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['50'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['50'][2].init(286, 104, 'tag === \'input\' && attrName === \'type\' && attrValue === \'text\'');
function visit425_50_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['50'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['50'][1].init(128, 508, '(tag === \'input\' && attrName === \'type\' && attrValue === \'text\') || (tag === \'script\' && attrName === \'type\' && attrValue === \'text/javascript\') || (tag === \'style\' && attrName === \'type\' && attrValue === \'text/css\') || (tag === \'area\' && attrName === \'shape\' && attrValue === \'rect\')');
function visit424_50_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['50'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['48'][1].init(45, 19, 'attrValue === \'get\'');
function visit423_48_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['48'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['47'][2].init(40, 21, 'attrName === \'method\'');
function visit422_47_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['47'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['47'][1].init(38, 65, 'attrName === \'method\' && attrValue === \'get\'');
function visit421_47_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['47'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['46'][3].init(156, 14, 'tag === \'form\'');
function visit420_46_3(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['46'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['46'][2].init(156, 104, 'tag === \'form\' && attrName === \'method\' && attrValue === \'get\'');
function visit419_46_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['46'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['46'][1].init(131, 637, '(tag === \'form\' && attrName === \'method\' && attrValue === \'get\') || (tag === \'input\' && attrName === \'type\' && attrValue === \'text\') || (tag === \'script\' && attrName === \'type\' && attrValue === \'text/javascript\') || (tag === \'style\' && attrName === \'type\' && attrValue === \'text/css\') || (tag === \'area\' && attrName === \'shape\' && attrValue === \'rect\')');
function visit418_46_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['46'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['44'][1].init(43, 26, 'attrValue === \'javascript\'');
function visit417_44_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['44'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['43'][2].init(38, 23, 'attrName === \'language\'');
function visit416_43_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['43'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['43'][1].init(36, 70, 'attrName === \'language\' && attrValue === \'javascript\'');
function visit415_43_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['42'][3].init(23, 16, 'tag === \'script\'');
function visit414_42_3(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['42'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['42'][2].init(23, 107, 'tag === \'script\' && attrName === \'language\' && attrValue === \'javascript\'');
function visit413_42_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['42'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['42'][1].init(-1, 769, '(tag === \'script\' && attrName === \'language\' && attrValue === \'javascript\') || (tag === \'form\' && attrName === \'method\' && attrValue === \'get\') || (tag === \'input\' && attrName === \'type\' && attrValue === \'text\') || (tag === \'script\' && attrName === \'type\' && attrValue === \'text/javascript\') || (tag === \'style\' && attrName === \'type\' && attrValue === \'text/css\') || (tag === \'area\' && attrName === \'shape\' && attrValue === \'rect\')');
function visit412_42_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['42'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['39'][1].init(82, 16, 'attr.value || ""');
function visit411_39_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['39'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['23'][4].init(42, 20, 'attrName === \'value\'');
function visit410_23_4(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['23'][4].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['23'][3].init(23, 15, 'tag === \'input\'');
function visit409_23_3(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['23'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['23'][2].init(23, 39, 'tag === \'input\' && attrName === \'value\'');
function visit408_23_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['23'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['23'][1].init(23, 92, '(tag === \'input\' && attrName === \'value\') || reEmptyAttribute.test(attrName)');
function visit407_23_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['23'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['22'][1].init(92, 16, '!trim(attrValue)');
function visit406_22_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['22'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['20'][1].init(26, 16, 'attr.value || ""');
function visit405_20_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['20'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].lineData[6]++;
KISSY.add("html-parser/writer/minify", function(S, BasicWriter, Utils) {
  _$jscoverage['/html-parser/writer/minify.js'].functionData[0]++;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[7]++;
  var trim = S.trim, isBooleanAttribute = Utils.isBooleanAttribute, collapseWhitespace = Utils.collapseWhitespace, reEmptyAttribute = new RegExp('^(?:class|id|style|title|lang|dir|on' + '(?:focus|blur|change|click|dblclick|mouse(' + '?:down|up|over|move|out)|key(?:press|down|up)))$');
  _$jscoverage['/html-parser/writer/minify.js'].lineData[15]++;
  function escapeAttrValue(str) {
    _$jscoverage['/html-parser/writer/minify.js'].functionData[1]++;
    _$jscoverage['/html-parser/writer/minify.js'].lineData[16]++;
    return String(str).replace(/"/g, "&quote;");
  }
  _$jscoverage['/html-parser/writer/minify.js'].lineData[19]++;
  function canDeleteEmptyAttribute(tag, attr) {
    _$jscoverage['/html-parser/writer/minify.js'].functionData[2]++;
    _$jscoverage['/html-parser/writer/minify.js'].lineData[20]++;
    var attrValue = visit405_20_1(attr.value || ""), attrName = attr.name;
    _$jscoverage['/html-parser/writer/minify.js'].lineData[22]++;
    if (visit406_22_1(!trim(attrValue))) {
      _$jscoverage['/html-parser/writer/minify.js'].lineData[23]++;
      return (visit407_23_1((visit408_23_2(visit409_23_3(tag === 'input') && visit410_23_4(attrName === 'value'))) || reEmptyAttribute.test(attrName)));
    }
    _$jscoverage['/html-parser/writer/minify.js'].lineData[26]++;
    return 0;
  }
  _$jscoverage['/html-parser/writer/minify.js'].lineData[30]++;
  function canRemoveAttributeQuotes(value) {
    _$jscoverage['/html-parser/writer/minify.js'].functionData[3]++;
    _$jscoverage['/html-parser/writer/minify.js'].lineData[33]++;
    return !(/[ "'=<>`]/).test(value);
  }
  _$jscoverage['/html-parser/writer/minify.js'].lineData[36]++;
  function isAttributeRedundant(el, attr) {
    _$jscoverage['/html-parser/writer/minify.js'].functionData[4]++;
    _$jscoverage['/html-parser/writer/minify.js'].lineData[37]++;
    var tag = el.nodeName, attrName = attr.name, attrValue = visit411_39_1(attr.value || "");
    _$jscoverage['/html-parser/writer/minify.js'].lineData[40]++;
    attrValue = trim(attrValue.toLowerCase());
    _$jscoverage['/html-parser/writer/minify.js'].lineData[41]++;
    return (visit412_42_1((visit413_42_2(visit414_42_3(tag === 'script') && visit415_43_1(visit416_43_2(attrName === 'language') && visit417_44_1(attrValue === 'javascript')))) || visit418_46_1((visit419_46_2(visit420_46_3(tag === 'form') && visit421_47_1(visit422_47_2(attrName === 'method') && visit423_48_1(attrValue === 'get')))) || visit424_50_1((visit425_50_2(visit426_50_3(tag === 'input') && visit427_51_1(visit428_51_2(attrName === 'type') && visit429_52_1(attrValue === 'text')))) || visit430_54_1((visit431_54_2(visit432_54_3(tag === 'script') && visit433_55_1(visit434_55_2(attrName === 'type') && visit435_56_1(attrValue === 'text/javascript')))) || visit436_58_1((visit437_58_2(visit438_58_3(tag === 'style') && visit439_59_1(visit440_59_2(attrName === 'type') && visit441_60_1(attrValue === 'text/css')))) || (visit442_62_1(visit443_62_2(tag === 'area') && visit444_63_1(visit445_63_2(attrName === 'shape') && visit446_64_1(attrValue === 'rect'))))))))));
  }
  _$jscoverage['/html-parser/writer/minify.js'].lineData[68]++;
  function isConditionalComment(text) {
    _$jscoverage['/html-parser/writer/minify.js'].functionData[5]++;
    _$jscoverage['/html-parser/writer/minify.js'].lineData[69]++;
    return (/\[if[^\]]+\]/).test(text);
  }
  _$jscoverage['/html-parser/writer/minify.js'].lineData[72]++;
  function isEventAttribute(attrName) {
    _$jscoverage['/html-parser/writer/minify.js'].functionData[6]++;
    _$jscoverage['/html-parser/writer/minify.js'].lineData[73]++;
    return (/^on[a-z]+/).test(attrName);
  }
  _$jscoverage['/html-parser/writer/minify.js'].lineData[76]++;
  function isUriTypeAttribute(attrName, tag) {
    _$jscoverage['/html-parser/writer/minify.js'].functionData[7]++;
    _$jscoverage['/html-parser/writer/minify.js'].lineData[77]++;
    return (visit447_78_1((visit448_78_2((/^(?:a|area|link|base)$/).test(tag) && visit449_78_3(attrName === 'href'))) || visit450_79_1((visit451_79_2(visit452_79_3(tag === 'img') && (/^(?:src|longdesc|usemap)$/).test(attrName))) || visit453_80_1((visit454_80_2(visit455_80_3(tag === 'object') && (/^(?:classid|codebase|data|usemap)$/).test(attrName))) || visit456_81_1((visit457_81_2(visit458_81_3(tag === 'q') && visit459_81_4(attrName === 'cite'))) || visit460_82_1((visit461_82_2(visit462_82_3(tag === 'blockquote') && visit463_82_4(attrName === 'cite'))) || visit464_83_1((visit465_83_2((visit466_83_3(visit467_83_4(tag === 'ins') || visit468_83_5(tag === 'del'))) && visit469_83_6(attrName === 'cite'))) || visit470_84_1((visit471_84_2(visit472_84_3(tag === 'form') && visit473_84_4(attrName === 'action'))) || visit474_85_1((visit475_85_2(visit476_85_3(tag === 'input') && (visit477_85_4(visit478_85_5(attrName === 'src') || visit479_85_6(attrName === 'usemap'))))) || visit480_86_1((visit481_86_2(visit482_86_3(tag === 'head') && visit483_86_4(attrName === 'profile'))) || (visit484_87_1(visit485_87_2(tag === 'script') && (visit486_87_3(visit487_87_4(attrName === 'src') || visit488_87_5(attrName === 'for')))))))))))))));
  }
  _$jscoverage['/html-parser/writer/minify.js'].lineData[91]++;
  function isNumberTypeAttribute(attrName, tag) {
    _$jscoverage['/html-parser/writer/minify.js'].functionData[8]++;
    _$jscoverage['/html-parser/writer/minify.js'].lineData[92]++;
    return (visit489_93_1((visit490_93_2((/^(?:a|area|object|button)$/).test(tag) && visit491_93_3(attrName === 'tabindex'))) || visit492_94_1((visit493_94_2(visit494_94_3(tag === 'input') && (visit495_94_4(visit496_94_5(attrName === 'maxlength') || visit497_94_6(attrName === 'tabindex'))))) || visit498_95_1((visit499_95_2(visit500_95_3(tag === 'select') && (visit501_95_4(visit502_95_5(attrName === 'size') || visit503_95_6(attrName === 'tabindex'))))) || visit504_96_1((visit505_96_2(visit506_96_3(tag === 'textarea') && (/^(?:rows|cols|tabindex)$/).test(attrName))) || visit507_97_1((visit508_97_2(visit509_97_3(tag === 'colgroup') && visit510_97_4(attrName === 'span'))) || visit511_98_1((visit512_98_2(visit513_98_3(tag === 'col') && visit514_98_4(attrName === 'span'))) || (visit515_99_1((visit516_99_2(visit517_99_3(tag === 'th') || visit518_99_4(tag == 'td'))) && (visit519_99_5(visit520_99_6(attrName === 'rowspan') || visit521_99_7(attrName === 'colspan'))))))))))));
  }
  _$jscoverage['/html-parser/writer/minify.js'].lineData[103]++;
  function cleanAttributeValue(el, attr) {
    _$jscoverage['/html-parser/writer/minify.js'].functionData[9]++;
    _$jscoverage['/html-parser/writer/minify.js'].lineData[104]++;
    var tag = el.nodeName, attrName = attr.name, attrValue = visit522_106_1(attr.value || "");
    _$jscoverage['/html-parser/writer/minify.js'].lineData[107]++;
    if (visit523_107_1(isEventAttribute(attrName))) {
      _$jscoverage['/html-parser/writer/minify.js'].lineData[108]++;
      attrValue = trim(attrValue).replace(/^javascript:[\s\xa0]*/i, '').replace(/[\s\xa0]*;$/, '');
    } else {
      _$jscoverage['/html-parser/writer/minify.js'].lineData[112]++;
      if (visit524_112_1(attrName === 'class')) {
        _$jscoverage['/html-parser/writer/minify.js'].lineData[113]++;
        attrValue = collapseWhitespace(trim(attrValue));
      } else {
        _$jscoverage['/html-parser/writer/minify.js'].lineData[115]++;
        if (visit525_115_1(isUriTypeAttribute(attrName, tag) || isNumberTypeAttribute(attrName, tag))) {
          _$jscoverage['/html-parser/writer/minify.js'].lineData[117]++;
          attrValue = trim(attrValue);
        } else {
          _$jscoverage['/html-parser/writer/minify.js'].lineData[119]++;
          if (visit526_119_1(attrName === 'style')) {
            _$jscoverage['/html-parser/writer/minify.js'].lineData[120]++;
            attrValue = trim(attrValue).replace(/[\s\xa0]*;[\s\xa0]*$/, '');
          }
        }
      }
    }
    _$jscoverage['/html-parser/writer/minify.js'].lineData[122]++;
    return attrValue;
  }
  _$jscoverage['/html-parser/writer/minify.js'].lineData[125]++;
  function cleanConditionalComment(comment) {
    _$jscoverage['/html-parser/writer/minify.js'].functionData[10]++;
    _$jscoverage['/html-parser/writer/minify.js'].lineData[126]++;
    return comment.replace(/^(\[[^\]]+\]>)[\s\xa0]*/, '$1').replace(/[\s\xa0]*(<!\[endif\])$/, '$1');
  }
  _$jscoverage['/html-parser/writer/minify.js'].lineData[131]++;
  function removeCDATASections(text) {
    _$jscoverage['/html-parser/writer/minify.js'].functionData[11]++;
    _$jscoverage['/html-parser/writer/minify.js'].lineData[132]++;
    return trim(text).replace(/^(?:[\s\xa0]*\/\*[\s\xa0]*<!\[CDATA\[[\s\xa0]*\*\/|[\s\xa0]*\/\/[\s\xa0]*<!\[CDATA\[.*)/, '').replace(/(?:\/\*[\s\xa0]*\]\]>[\s\xa0]*\*\/|\/\/[\s\xa0]*\]\]>)[\s\xa0]*$/, '');
  }
  _$jscoverage['/html-parser/writer/minify.js'].lineData[144]++;
  function MinifyWriter() {
    _$jscoverage['/html-parser/writer/minify.js'].functionData[12]++;
    _$jscoverage['/html-parser/writer/minify.js'].lineData[145]++;
    var self = this;
    _$jscoverage['/html-parser/writer/minify.js'].lineData[146]++;
    MinifyWriter.superclass.constructor.apply(self, arguments);
    _$jscoverage['/html-parser/writer/minify.js'].lineData[147]++;
    self.inPre = 0;
  }
  _$jscoverage['/html-parser/writer/minify.js'].lineData[150]++;
  S.extend(MinifyWriter, BasicWriter, {
  comment: function(text) {
  _$jscoverage['/html-parser/writer/minify.js'].functionData[13]++;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[155]++;
  if (visit527_155_1(isConditionalComment(text))) {
    _$jscoverage['/html-parser/writer/minify.js'].lineData[156]++;
    text = cleanConditionalComment(text);
    _$jscoverage['/html-parser/writer/minify.js'].lineData[157]++;
    MinifyWriter.superclass.comment.call(this, text);
  }
}, 
  openTag: function(el) {
  _$jscoverage['/html-parser/writer/minify.js'].functionData[14]++;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[165]++;
  var self = this;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[166]++;
  if (visit528_166_1(el.tagName == 'pre')) {
    _$jscoverage['/html-parser/writer/minify.js'].lineData[167]++;
    self.inPre = 1;
  }
  _$jscoverage['/html-parser/writer/minify.js'].lineData[169]++;
  MinifyWriter.superclass.openTag.apply(self, arguments);
}, 
  closeTag: function(el) {
  _$jscoverage['/html-parser/writer/minify.js'].functionData[15]++;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[176]++;
  var self = this;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[177]++;
  if (visit529_177_1(el.tagName == 'pre')) {
    _$jscoverage['/html-parser/writer/minify.js'].lineData[178]++;
    self.inPre = 0;
  }
  _$jscoverage['/html-parser/writer/minify.js'].lineData[180]++;
  MinifyWriter.superclass.closeTag.apply(self, arguments);
}, 
  cdata: function(cdata) {
  _$jscoverage['/html-parser/writer/minify.js'].functionData[16]++;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[187]++;
  cdata = removeCDATASections(cdata);
  _$jscoverage['/html-parser/writer/minify.js'].lineData[188]++;
  MinifyWriter.superclass.cdata.call(this, cdata);
}, 
  attribute: function(attr, el) {
  _$jscoverage['/html-parser/writer/minify.js'].functionData[17]++;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[192]++;
  var self = this, name = attr.name, normalizedValue, value = visit530_195_1(attr.value || "");
  _$jscoverage['/html-parser/writer/minify.js'].lineData[198]++;
  if (visit531_198_1(canDeleteEmptyAttribute(el, attr) || isAttributeRedundant(el, attr))) {
    _$jscoverage['/html-parser/writer/minify.js'].lineData[201]++;
    return;
  }
  _$jscoverage['/html-parser/writer/minify.js'].lineData[204]++;
  if (visit532_204_1(isBooleanAttribute(name))) {
    _$jscoverage['/html-parser/writer/minify.js'].lineData[206]++;
    self.append(" ", name);
    _$jscoverage['/html-parser/writer/minify.js'].lineData[207]++;
    return;
  }
  _$jscoverage['/html-parser/writer/minify.js'].lineData[211]++;
  normalizedValue = escapeAttrValue(cleanAttributeValue(el, attr));
  _$jscoverage['/html-parser/writer/minify.js'].lineData[213]++;
  if (visit533_213_1(value && canRemoveAttributeQuotes(value))) {
  } else {
    _$jscoverage['/html-parser/writer/minify.js'].lineData[216]++;
    normalizedValue = '"' + normalizedValue + '"';
  }
  _$jscoverage['/html-parser/writer/minify.js'].lineData[219]++;
  self.append(" ", name, "=", normalizedValue);
}, 
  text: function(text) {
  _$jscoverage['/html-parser/writer/minify.js'].functionData[18]++;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[226]++;
  var self = this;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[227]++;
  if (visit534_227_1(!self.inPre)) {
    _$jscoverage['/html-parser/writer/minify.js'].lineData[229]++;
    text = collapseWhitespace(text);
  }
  _$jscoverage['/html-parser/writer/minify.js'].lineData[231]++;
  self.append(text);
}});
  _$jscoverage['/html-parser/writer/minify.js'].lineData[235]++;
  return MinifyWriter;
}, {
  requires: ['./basic', '../utils']});
