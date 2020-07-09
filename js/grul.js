/*  Author: Ryan Taylor Montgomery
 *  Date: May 27th 2019
 *  License: MIT License
 *
 *	Copyright (c) 2019 Vault Lambda LLC
 *
 *	Permission is hereby granted, free of charge, to any person obtaining a copy
 *	of this software and associated documentation files (the "Software"), to deal
 *	in the Software without restriction, including without limitation the rights
 *	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *	copies of the Software, and to permit persons to whom the Software is
 *	furnished to do so, subject to the following conditions:
 *
 *	The above copyright notice and this permission notice shall be included in all
 *	copies or substantial portions of the Software.
 *
 *	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 *	SOFTWARE.
 * 
 */
const grul = new (function () {
    /*  Function Name: this.docs
     *  Description: Retrieves api information from source
     */
    this.docs = function () {
        let grulref = this;
        let Utilities = Object.keys(this);
        let source = this.constructor.toString();
        const regex = /\/\*?(?:\t|\ |\r|\n)*?Function\ Name:(?:.|\r|\n)*?this\.([a-zA-Z0-9]*)(?:.|\r|\n)*?Description:((?:.|\r|\n)*?)\*\//gmi;
        let m;
        let funcDetail = {};
        while ((m = regex.exec(source)) !== null) {
            // This is necessary to avoid infinite loops with zero-width matches
            if (m.index === regex.lastIndex) {
                regex.lastIndex++;
            }
  
            // The result can be accessed through the `m`-variable.
            funcDetail[m[1]] = {
                "description": m[2]
            };
        }
        let docs = Utilities.map(function (key) {
            return {
                name: key,
                args: grulref.funcArgs(grul[key]),
                details: (key in funcDetail ? funcDetail[key] : { "description": "No description provided" })
            };
        });
        return docs;
    };
    /*  Function Name: this.clone
     *  Description: Clones data (breaking attachment to existing datasets)
     */
    this.clone = function (obj) {
        return JSON.parse(JSON.stringify(obj));
    };
    /*  Function Name: this.funcArgs
     *  Description: Retrieves functions arguments given a function definition
     */
    this.funcArgs = function (func) {
        return (func + '')
            .replace(/[/][/].*$/mg, '')
            .replace(/\s+/g, '')
            .replace(/[/][*][^/*]*[*][/]/g, '')
            .split('){', 1)[0].replace(/^[^(]*[(]/, '')
            .replace(/=[^,]+/g, '')
            .split(',').filter(Boolean);
    };
    /*  Function Name: this.executeLogic
     *  Description: Executes logic of lambda depending on passed structure (currently only utilized by atPattern)
     */
    this.executeLogic = function (logicController, location, patternIndex, aData, historicalTypePath, historicalLiteralPath, initial) {
        var logic = logicController;
        if (logic.constructor === Array) {
            if (logic[patternIndex].constructor === Object) {
                continueTraversal = location in logic[patternIndex] ? logic[patternIndex][location](aData, historicalTypePath, historicalLiteralPath, initial) : true;
            }
            else {
                continueTraversal = logic[patternIndex](aData, historicalTypePath, historicalLiteralPath, initial);
            }
        }
        else if (logic.constructor === Object) {
            continueTraversal = location in logic ? logic[location](aData, historicalTypePath, historicalLiteralPath, initial) : true;
        }
        else {
            continueTraversal = logic(aData, historicalTypePath, historicalLiteralPath, initial);
        }
        return continueTraversal;
    };
    //Recursive Helper Functions
    /*	Function Name: this.pluck
     *	Description: This function traverses data given a path (array of literal traversals in order)
     */
    this.pluck = function (data, path, set = null) {
        if (path.length > 1) {
            return this.pluck(data[path[0]], path.slice(1), set);
        }
        else {
            if (path.length == 0) {
                return data;
            }
            else {
                if (set == null) {
                    return data[path[0]];
                }
                else {
                    data[path[0]] = set;
                    return data[path[0]];
                }
            }
        }
    };
    /* 	Function Name: this.pathExists
     *	Description: This function checks to see if given path exists in a set
     */
    this.pathExists = function (data, bindpath, curpath = []) {
        var isEqual = this.arrEquals(bindpath, curpath) && bindpath.length == curpath.length;
        if (isEqual) { }
        else {
            curpath.push(bindpath[curpath.length]);
        }
        try {
            if (this.pluck(data, curpath) !== undefined) {
                if (isEqual == true) {
                    return true;
                }
                return this.pathExists(data, bindpath, curpath);
            }
            else {
                return bindpath.slice(curpath.length - 1);
            }
        }
        catch (exception) {
            return bindpath.slice(curpath.length - 1);
        }
    };
    /*   Function Name: this.scaffold
     *   Description: This function constructs a blank incoming typed item
     */
    this.scaffold=function(input) {
        if (input.constructor == Object) {
            return {};
        }
        else if (input.constructor === Array) {
            return [];
        }
        else {
            return input;
        }
    }
    /*  Function Name: this.isPrimitive
     *  Description: This function determines whether or not the argument is a primitive type in javascript
     */
    this.isPrimitive = function (arg) {
        var type = typeof arg;
        return arg == null || (type != "object" && type != "function");
    }
    
    /*	Function Name: this.arrEquals
     *	Description: This function iterates through array elements to check equality
     */
    this.arrEquals = function (arr1, arr2) {
        if (arr1.length !== arr2.length)
            return false;
        for (var i = arr1.length; i--;) {
            if (arr1[i] !== arr2[i])
                return false;
        }
        return true;
    };
  
    //Recursive Lambda's
    /*  Function Name: this.atHierarchy
     *  Description: This function traverses any static or dynamic template hierarchy executing any head, tail logic to restructure a 2 dimensional JSON set
     *              into the defined hierarchical set and grouping rows by a unique dynamically generated head key
     */
    this.atHierarchy = function (data, hierarchy, historicalTypePath=[], historicalLiteralPath=[],root=this.scaffold(hierarchy)){
        if (hierarchy.constructor === Array) {
            hierarchy.forEach((template) => {
                let compound = {}; // defines data/hierarchy/path to be set for next 
                let heads = []; // defines head which generates hierarchical compound key
                let tails = []; // defines tails which generates hierarchical values based on previous recursive action
                let branches = []; // defined branches which reflect hierarchical child slots
                let rHierarchy = template.constructor === Function ? template(data, historicalTypePath, historicalLiteralPath, hierarchy) : template;
                let out = this.scaffold(rHierarchy); // defines scaffolding for template to be cloned into a segment instance
                //build branches
                this.atEvery(rHierarchy, (segmentInput, typePath, literalPath) => {
                    if (segmentInput.constructor === Array) {
                        let segmentMap = {
                            "segmentTypePath": typePath,
                            "segmentLiteralPath": literalPath,
                            "hierarchy": segmentInput
                        };
                        branches.push(segmentMap);
                        this.pluck(out, literalPath, [])
                        return false;
                    }
                    else if (segmentInput.constructor === Object && "head" in segmentInput && segmentInput.head.constructor === Function) {
                        let segmentMap = {
                            "segmentTypePath": typePath,
                            "segmentLiteralPath": literalPath,
                            "map": segmentInput.head
                        };
                        heads.push(segmentMap)
                        this.pluck(out, segmentMap.segmentLiteralPath, "");
                        return false;
                    }
                    else if (segmentInput.constructor === Object && "tail" in segmentInput && segmentInput.tail.constructor === Function) {
                        let segmentMap = {
                            "segmentTypePath": typePath,
                            "segmentLiteralPath": literalPath,
                            "map": segmentInput.tail
                        };
                        tails.push(segmentMap);
                        this.pluck(out, segmentMap.segmentLiteralPath, "");
                        return false;
                    }
                    else {
                        this.pluck(out, literalPath, this.scaffold(segmentInput))
                    }
                });
                //fill segments
                data.forEach((row) => {
                    let segment = this.clone(out);
                    let compoundKey = "";
                    //fill segment with head results
                    heads.forEach((head) => {
                        let value = head.map(row,
                            historicalTypePath.concat(head.segmentTypePath),
                            historicalLiteralPath.concat(head.segmentLiteralPath));
                        this.pluck(segment, head.segmentLiteralPath, value);
                        compoundKey += JSON.stringify(value);
                    });
                    if (compoundKey in compound) {
                        compound[compoundKey].rows.push(row);
                    }
                    else {
                        compound[compoundKey] = {
                            rows: [row],
                            branches: branches,
                            segment: segment
                        }
                    }
                })
  
                //fill segment with tail results
                Object.keys(compound).forEach((key) => {
                    let parent = this.pluck(root, historicalLiteralPath);
                    parent.push(compound[key].segment);
                    let typePath = historicalTypePath.concat(out.constructor);
                    let literalPath = historicalLiteralPath.concat([parent.length - 1]);
                    compound[key].branches.forEach((branch) => {
                        let nTypePath = typePath.concat(branch.segmentTypePath);
                        let nLiteralPath = literalPath.concat(branch.segmentLiteralPath);
                        this.atHierarchy(compound[key].rows, branch.hierarchy, nTypePath, nLiteralPath, root);
                    })
                    tails.forEach((tail) => {
                        this.pluck(compound[key].segment, tail.segmentLiteralPath, tail.map(
                            compound[key].rows,
                            historicalTypePath.concat(compound[key].segmentTypePath),
                            historicalLiteralPath.concat(compound[key].segmentLiteralPath),
                            rHierarchy,
                            branches
                        ))
                    })
                })
            });
        }
        else {
            let tails = [];
            this.atEvery(hierarchy, (input,htp,hlp) => {
                if (input.constructor === Array) {
                    this.pluck(root, hlp, this.scaffold(input));
                    this.atHierarchy(data, input, htp, hlp, root);
                    return false;
                }
                else if (input.constructor === Object && "head" in input && input.head.constructor === Function) {
                    this.pluck(root, hlp, input.head(data, htp, hlp, hierarchy));
                    return false;
                }
                else if (input.constructor === Object && "tail" in input && input.tail.constructor === Function) {
                    tails.push({
                        segmentTypePath: htp,
                        segmentLiteralPath: hlp,
                        map: input.tail
                    });
                    this.pluck(root, hlp, "");
                    return false;
                }
                else {
                    this.pluck(root,hlp,this.scaffold(input));
                }
            })
            tails.forEach((tail) => {
                this.pluck(root,tail.segmentLiteralPath,tail.map(data,tail.segmentTypePath,tail.segmentLiteralPath,hierarchy))
            })
        }
        return root;
    }
    /*  Function Name: this.atStructure
     *  Description: This function traverses any multidimensional set and modifies the existing path structure (metaPath) to the specified desired path structure
     */
    this.atStructure = function (data, metaPath, logic, relativity = 0, cont = false, historicalTypePath = [], historicalLiteralPath = [], rootData = data) {
        /* [{... children:[{...}]}] 
         * oldMetaPath => ["children",Array]
         * newMetaPath => ["children",Object]
         * keyPaths => []
         */
    }
  
    /* 	Function Name: this.atMeta
     *	Description: This function iterates through values which have matching literal/typepaths from the base of the object
     */
    this.atMeta = function (data, metaPath, logic, relativity = 0, cont = false, historicalTypePath = [], historicalLiteralPath = [],  rootData = data) {
        if (metaPath.length == 0 || metaPath[0].constructor === Array) {
            if (metaPath.length == 0) {
                return rootData;
            }
        }
        else {
            metaPath = [metaPath];
        }
        var currentMeta = [];
        for (var i = 0; i < metaPath.length; i++) {
            if (metaPath[i].length > 0) {
                currentMeta.push(metaPath[i][0]);
                metaPath[i] = metaPath[i].slice(1);
            }
            else {
                var aData = relativity == 0 ? data : this.pluck(rootData, historicalLiteralPath.slice(0, historicalLiteralPath.length - relativity));
                //Perform Logic
                this.executeLogic(logic, "head", i, data, historicalTypePath, historicalLiteralPath, rootData);
                metaPath.splice(i, 1);
            }
        }
        for (var i = 0; i < metaPath.length; i++) {
            if (currentMeta[i].constructor === Function) {
                //find object types of matching .constructor
                if (currentMeta[i] === data.constructor) {
                    if (currentMeta[i] === Object) {
                        //Iterate through object calling atMeta for each item
                        Object.keys(data).forEach((key) => {
                            let htp = (historicalTypePath).slice(0);
                            htp.push(Object);
                            let hlp = (historicalLiteralPath).slice(0);
                            hlp.push(key);
                            this.atMeta(data[key], (metaPath).slice(0), logic, relativity, cont, htp, hlp, rootData);
                        });
                    }
                    else if (currentMeta[i] === Array) {
                        //Iterate through array calling atMeta for each item
                        for (var i = 0; i < data.length; i++) {
                            let htp = (historicalTypePath).slice(0);
                            htp.push(Array);
                            let hlp = (historicalLiteralPath).slice(0);
                            hlp.push(i);
                            this.atMeta(data[i], (metaPath).slice(0), logic, relativity, cont, htp, hlp, rootData);
                        }
                    }
                }
                else if (currentMeta[i] === Array || currentMeta[i] === Object) {
                }
            }
            else if (currentMeta[i].constructor === String && currentMeta[i] in data) {
                //find object key of string
                let htp = (historicalTypePath).slice(0);
                htp.push(String);
                let hlp = (historicalLiteralPath).slice(0);
                hlp.push(currentMeta[i]);
                this.atMeta(data[currentMeta[i]], (metaPath).slice(0), logic, relativity, cont, htp, hlp, rootData);
            }
            else if (currentMeta[i].constructor === Number && currentMeta[i] in data) {
                //find array index of value
                let htp = (historicalTypePath).slice(0);
                htp.push(Number);
                let hlp = (historicalLiteralPath).slice(0);
                hlp.push(currentMeta[i]);
                this.atMeta(data[currentMeta[i]], (metaPath).slice(0), logic, relativity, cont, htp, hlp, rootData);
            }
        }
        return rootData;
    };
    /*	Function Name: this.atPattern
     *	Description: This function iterates through values which have matching literal/typepaths throughout the entirety of an object 
     *	- With cont==true this.atPattern will spawn new pattern traversals when patterns are recorgnized to ensure it matches patters overlapping patterns (Warning, may be expensive)
     */
    this.atPattern = function (data, metaPath, logic, relativity = 0, cont = false, historicalTypePath = [], historicalLiteralPath = [], curMetaIndex = 0, rootData = data) {
        var matched = {};
        var aData;
        if (metaPath[0].constructor === Array) {
            //Perform Patterns in optimized single pass
            if (curMetaIndex.constructor === Array) {
            }
            else {
                curMetaIndex = [];
                for (var i = 0; i < metaPath.length; i++) {
                    curMetaIndex.push(0);
                }
            }
        }
        else {
            metaPath = [metaPath];
            curMetaIndex = [0];
        }
  
        if (historicalLiteralPath.length > 0) {
            for (var i = 0; i < metaPath.length; i++) {
                if (historicalTypePath[historicalTypePath.length - 1].name == metaPath[i][curMetaIndex[i]].name) {
                    //increment curMetaIndex
                    curMetaIndex[i]++;
                }
                else if (historicalLiteralPath[historicalLiteralPath.length - 1] == metaPath[i][curMetaIndex[i]]) {
                    //increment curMetaIndex
                    curMetaIndex[i]++;
                }
                else {
                    //reset curMetaIndex
                    curMetaIndex[i] = 0;
                }
                if (curMetaIndex[i] == metaPath[i].length) {
                    var continueTraversal;
                    aData = relativity == 0 ? data : this.pluck(rootData, historicalLiteralPath.slice(0, (historicalLiteralPath.length) + relativity));
                    continueTraversal = this.executeLogic(logic, "head", i, aData, historicalTypePath, historicalLiteralPath, rootData);
                    if (continueTraversal == false) {
                        return aData; //break if logic returns false
                    }
                    matched[i] = true;
                    curMetaIndex[i] = 0;
                }
            }
        }
        if (data == null) {
            return;
        }
        if (data.constructor === Object) {
            Object.keys(data).forEach((key) => {
                var nhtpath = historicalTypePath.slice(0);
                nhtpath.push(Object);
                let nhlpath = this.clone(historicalLiteralPath);
                nhlpath.push(key);
                this.atPattern(data[key], metaPath, logic, relativity, cont, nhtpath, nhlpath, this.clone(curMetaIndex), rootData);
            });
        }
        else if (data.constructor === Array) {
            for (var i = 0; i < data.length; i++) {
                var nhtpath = historicalTypePath.slice(0);
                nhtpath.push(Array);
                let nhlpath = this.clone(historicalLiteralPath);
                nhlpath.push(i);
                this.atPattern(data[i], metaPath, logic, relativity, cont, nhtpath, nhlpath, this.clone(curMetaIndex), rootData);
            }
        }
  
        //Tail Logic
        for (var i = 0; i < metaPath.length; i++) {
            if (i in matched) {
                continueTraversal = this.executeLogic(logic, "tail", i, aData, historicalTypePath, historicalLiteralPath, rootData);
                if (continueTraversal == false) {
                    return aData;
                }
            }
        }
        return data;
    };
  
    /*	Function Name: this.atShallowestPattern
     *	Description: This function iterates this.atPattern, stores the inputs with the least depth to be executed logically
     *	- With cont==true this.atPattern will spawn new pattern traversals when patterns are recorgnized to ensure it matches patters overlapping patterns (Warning, may be expensive)
     */
    this.atShallowestPattern = function (data, metaPath, logic, relativity = 0, cont = false) {
        var leastDepth = Infinity;
        var inputs = [];
        this.atPattern(data, metaPath, function (input, historicalTypePath, historicalLiteralPath) {
            if (historicalLiteralPath.length < leastDepth) {
                leastDepth = historicalLiteralPath.length;
                inputs = [];
                inputs.push(input);
            }
            else if (historicalLiteralPath.length > leastDepth) {
                return false;
            }
            else {
                inputs.push(input);
            }
        }, relativity, cont);
        for (var i = 0; i < inputs.length; i++) {
            logic(inputs[i]);
        }
        return data;
    };
    /*	Function Name: this.atDeepestPattern
     *	Description: This function iterates this.atPattern, stores the inputs with most depth to be executed logically - (Returns false within .atPattern where depth is greater than)
     *	- With cont==true this.atPattern will spawn new pattern traversals when patterns are recorgnized to ensure it matches patters overlapping patterns (Warning, may be expensive)
     */
    this.atDeepestPattern = function (data, metaPath, logic, relativity = 0, cont = false) {
        var greatestDepth = -1;
        var inputs = [];
        this.atPattern(data, metaPath, function (input, historicalTypePath, historicalLiteralPath) {
            if (historicalLiteralPath.length > greatestDepth) {
                greatestDepth = historicalLiteralPath.length;
                inputs = [];
            }
            inputs.push({
                data: input,
                historicalTypePath: historicalTypePath,
                historicalLiteralPath: historicalLiteralPath
            });
        }, relativity, cont);
        for (var i = 0; i < inputs.length; i++) {
            logic(inputs[i].data, inputs[i].historicalTypePath, inputs[i].historicalLiteralPath);
        }
        return data;
    };
    /* 	Function Name: this.atEnds
     *	Description: This function iterates through the primitive ends of objects
     */
    this.atEnds = function (data, logic) {
        if (data.constructor === Object) {
            Object.keys(data).forEach((key) => {
                this.atEnds(data[key], logic);
            })
        }
        else if (data.constructor === Array) {
            for (var i = 0; i < data.length; i++) {
                this.atEnds(data[i], logic);
            }
        }
        else if (data.constructor === Function) {
            if (this.funcArgs(data).length == 0) {
                this.atEnds(data(), logic)
            }
        }
        else {
            logic(data);
        }
        return data;
    };
    /*	Function Name: this.atEvery
     * 	Description: This function runs passed logic at every potential traversal or endpoint
     */
    this.atEvery = function (data, logic, historicalTypePath = [], historicalLiteralPath = [], rootData = data) {
        var iContinue = logic(data, historicalTypePath, historicalLiteralPath, rootData);
        if (!(iContinue == true || iContinue == undefined || iContinue == null)) {
            return;
        }
        var newTypePath = this.clone(historicalTypePath);
        newTypePath.push(data.constructor);
        if (data.constructor == Array) {
            for (var i = 0; i < data.length; i++) {
                var newLitPath = this.clone(historicalLiteralPath);
                newLitPath.push(i);
                this.atEvery(data[i], logic, newTypePath, newLitPath, rootData);
            }
        }
        else if (data.constructor == Object) {
            Object.keys(data).forEach((key) => {
                var newLitPath = this.clone(historicalLiteralPath);
                newLitPath.push(key);
                this.atEvery(data[key], logic, newTypePath, newLitPath, rootData);
            });
        }
        return data;
    }
    /*	Function Name: this.atMetaEnds
     * 	Description: This function runs this.atMeta, and then performs logic at the ends of the object returned to it by this.atMeta
     */
    this.atMetaEnds = function (data, metaPath, logic) {
        var recursiveRef = this;
        recursiveRef.atMeta(data, metaPath, function (input) {
            recursiveRef.atEnds(input, logic);
        });
        return data;
    };
    /*	Function Name: this.atPatternEnds
     *	Description: This function runs this.atPattern, and then performs logic at the pattern of the object returned to it by this.atPattern
     */
    this.atPatternEnds = function (data, metaPath, logic, relativity = 0) {
        var recursiveRef = this;
        recursiveRef.atPattern(data, metaPath, function (input) {
            recursiveRef.atEnds(input, logic);
        }, relativity);
        return data;
    };
    /*	Function Name: this.atMatching
     *	Description: This function traverses through set, determining if same path exists in data, and executes the associated path function "atMatchingFunction" or the sequence
     */
    this.atMatching = function (data, set, metaPath = [], literalPath = []) {
        var curObj = this.pluck(set, metaPath);
        var curData;
        var exists = false;
        try {
            curData = this.pluck(data, metaPath);
            exists = true;
        }
        catch (exception) {
            exists = false;
        }
        if (curObj.constructor.name == "Object") {
            Object.keys(curObj).forEach((key) => {
                var nMetaPath = this.clone(metaPath);
                nMetaPath.push(key);
                var nLiteralPath = this.clone(literalPath);
                nLiteralPath.push(key);
                this.atMatching(data, set, nMetaPath, nLiteralPath);
  
            });
        }
        else if (curObj.constructor.name === Array && exists) {
            for (var i = 0; i < curObj.length; i++) {
                var nMetaPath = this.clone(metaPath);
                nMetaPath.push(i);
                for (var x = 0; x < curData.length; x++) {
                    var nLiteralPath = this.clone(literalPath);
                    nLiteralPath.push(x);
                    this.atMatching(data, set, nMetaPath, nLiteralPath);
                }
            }
        }
        else if (curObj.constructor === Function) {
            if (metaPath[metaPath.length - 1] == "atMatchingFunction") {
                //Perform Logic at Path of data object
                curObj(this.pluck(data, literalPath.slice(0, - 1)), this)
            }
        }
        else if (curObj.constructor.name === String) {
            if (metaPath[metaPath.length - 1] == "atMatchingFunction") {
                //Perform Logic at Path of data object
                window[curObj](this.pluck(data, literalPath.slice(0, - 1)), this)
            }
            else if (exists) {
                curData += curObj
            }
        }
        else if (curObj.constructor === Number && exists) {
            //Do an Equivalence Modifier
            if (curData.constructor.name == curObj.constructor.name) {
                curData += curObj;
            }
        }
    };
    /*	Function Name: this.atDepth
     *	Description: This function traverses through set, pushing all items at a dimensional depth from base into an array and returning them
     */
    this.atDepth = function (data, depth = 0, logic, historicalTypePath = [], historicalLiteralPath = [], first = true, rootData = data) {
        if (first == true) {
            this.atDepthContainer = [];
            first = false;
        }
  
        if (depth > 0) {
            depth--
            if (data.constructor.name == "Object") {
                Object.keys(data).forEach((key) => {
                    this.atDepth(data[key], depth, logic, first);
                })
            }
            else if (data.constructor.name == "Array") {
                for (var i = 0; i < data.length; i++) {
                    this.atDepth(data[i], depth, logic, first);
                }
            }
        }
        else {
            logic(data, historicalTypePath, historicalLiteralPath, rootData);
            this.atDepthContainer.push(data);
        }
  
        return this.atDepthContainer;
    };
    /*	Function Name: this.atDiff
     *	Description: This function traverses through multiple sets, keeping track of the structural and data differential's between all listed sets. Base sets must be held in array form
     */
    this.atDiff = function (data, diflogic = null, relativity = 0, cont = false, primary = 0) {
        var PatchDiffs = [];
        if (data.constructor === Array) {
            if (data.length > 1) {
                this.atEvery(data[0], (curData, logic, metaPath, literalPath, rootData) => {
                    for (var i = 1; i < data.length; i++) {
                        //compare 0th to others
                        var diffCheck = this.pathExists(data[i], literalPath);
                        if (diffCheck == true && diffCheck.constructor === Boolean) {
                            if (curData.constructor != Object && curData.constructor != Array) {
                                var compareSetVal = this.pluck(data[i], literalPath);
                                if (curData == compareSetVal) {
                                    //set equivalent
                                }
                                else {
                                    var newPath = this.clone(literalPath);
                                    newPath.splice(0, 0, i)
                                    //set requires updating to base set
                                    var newPatch = { "op": "replace", "path": newPath, "value": curData, "ref": data };
                                    PatchDiffs.push(newPatch);
                                    if (diflogic != null) {
                                        diflogic(curData, literalPath, rootData, data, i, newPatch);
                                    }
                                }
                            }
                            return true;
                        }
                        else {
                            var newPath = this.clone(literalPath);
                            newPath.splice(0, 0, i)
                            var newPatch = { "op": "add", "path": newPath, "value": curData, "ref": data };
                            PatchDiffs.push(newPatch);
                            if (diflogic != null) {
                                diflogic(curData, literalPath, rootData, data, i, newPatch);
                            }
                            return false;
                        }
  
                    }
                });
            }
            else {
                console.log("Nothing to compare against");
            }
        }
        else {
            console.log("Base data is not an array");
        }
  
        return PatchDiffs;
    };
  })();
  
  try {
    module.exports = grul;
    console.log("Node Load");
  }
  catch (exception) {
    grul.pluck = function (data, path, set = null) {
        if (path.length > 1) {
            return this.pluck(data[path[0]], path.slice(1), set);
        }
        else {
            if (path.length == 0) {
                return data;
            }
            else {
                if (set == null) {
                    if (data instanceof HTMLElement) {
                        return data.getAttribute(path[0]);
                    }
                    else {
                        return data[path[0]];
                    }
                }
                else {
                    data[path[0]] = set;
                    return data[path[0]];
                }
            }
        }
    };
    console.log("Vanilla JavaScript Load");
  }