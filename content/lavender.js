(function() {

    function walk(node) 
    {
        // I stole this function from here:
        // http://is.gd/mwZp7E
    
        var child, next;
    
        switch ( node.nodeType )  
        {
            case 1:  // Element
            case 9:  // Document
            case 11: // Document fragment
                child = node.firstChild;
                while ( child ) 
                {
                    next = child.nextSibling;
                    walk(child);
                    child = next;
                }
                break;
    
            case 3: // Text node
                handleText(node);
                break;
        }
    }
    
    function handleText(textNode)
    {
        var v = textNode.nodeValue;
        
        v = lavenderize(v);

        textNode.nodeValue = v;
    }
    
    
    
    // Define/build some constants
    var conjunctions = ["after", "although", "and", "as", "because", "before", "but", "by", "even", "in", "lest", "once", "only", "or", "provided", "since", "so", "than", "that", "though", "till", "unless", "until", "when", "whenever", "where", "wherever", "while"];

    var prepositions = [ "aboard", "about", "above","across", "after", "against", "along", "amid", "among", "anti", "around", "as", "at", "before", "behind", "below", "beneath", "beside", "besides", "between", "beyond", "but", "by", "concerning", "considering", "despite", "down", "during", "except", "excepting", "excluding", "following", "for", "from", "in", "inside", "into", "like", "minus", "near", "of", "off", "on", "onto", "opposite", "outside", "over", "past", "per", "plus", "regarding", "round", "save", "since", "than", "through", "to", "toward", "towards", "under", "underneath", "unlike", "until", "up", "upon", "versus", "via", "with", "within", "without" ];

    var hisHis = ["his", "His"];

    var punc = [".", "..", "...", "....", ",", "?", "!", ":", ";", "(", ")" , "'", '"', "\"", "`"];

    var mappingFrom = [ " she ", " he ", " him ", " her ", " hers ", " himself ", " herself ", " s/he ", " (s)he ", " he or she ", " she or he "];

    var mappingTo = [ " ze ", " ze ", " hir ", " hir ", " hirs ", " hirself ", " hirself ", " ze ", " ze ", " ze ", " ze " ];

    function cap(string)
    {
        return " " + string.charAt(1).toUpperCase() + string.slice(2);
    }

    mappingFrom = mappingFrom.concat(mappingFrom.map(function(elem) { return cap(elem); }));
    mappingTo = mappingTo.concat(mappingTo.map(function(elem) { return cap(elem); }));

    var base = mappingTo.length;
    for (var i = 0; i < base; i++)
    {
        for (var j = 0; j < punc.length; j++)
        {
            var from = mappingFrom[i];
            from = from.slice(0, -1) + punc[j];
            mappingFrom.push(from);
            
            var to = mappingTo[i];
            to = to.slice(0, -1) + punc[j];
            mappingTo.push(to);
            
            var from = mappingFrom[i];
            from = punc[j] + from.slice(1, from.length);
            mappingFrom.push(from);
            
            var to = mappingTo[i];
            to = punc[j] + to.slice(1, to.length);
            mappingTo.push(to);
        } 
    }

    var fromNoSpace = [ "she", "he", "him", "her", "his", "hers", "himself", "herself", "s/he", "(s)he"];
    var toNoSpace = [ "ze", "ze", "hir", "hir", "hirs", "hirs", "hirself", "hirself", "ze", "ze" ];
    fromNoSpace = fromNoSpace.concat(fromNoSpace.map(function(elem) { return cap(elem); }));
    toNoSpace = toNoSpace.concat(toNoSpace.map(function(elem) { return cap(elem); }));
    var base = fromNoSpace.length;
    for (var i = 0; i < base; i++)
    {
        for (var j = 0; j < punc.length; j++)
        {
            var from = fromNoSpace[i] + punc[j];
            fromNoSpace.push(from);
            
            var to = toNoSpace[i] + punc[j];
            toNoSpace.push(to);
        }
    }


    var followsHirs = conjunctions.concat(prepositions).concat(punc);

    var hisPunc = [];
    var puncHis = []
    for ( var i = 0; i < punc.length; i++ ) 
    { 
        hisPunc.push("his" + punc[i]); 
        hisPunc.push("His" + punc[i]); 
        puncHis.push(punc[i] + "his"); 
        puncHis.push(punc[i] + "His"); 
    }


    // Function that replaces 'his' in a text based on the heuristically deretmined part of speech
    function replaceHis(text)
    {
        tokens = text.split(" ");
        for (var i = 0; i < (tokens.length-1); i++)
        {
            tokens[i] = tokens[i].toString();
            if ( hisPunc.indexOf(tokens[i]) > -1 )
            {
                var hirs;
                if (tokens[i].charAt(0) == "h") { hirs = "hirs"; }
                else { hirs = "Hirs"; }
                tokens[i] = hirs + tokens[i].slice(-1);
            } else if ( puncHis.indexOf(tokens[i]) > -1 )
            {
                var hirs;
                if (tokens[i].charAt(1) == "h") { hirs = "hirs"; }
                else { hirs = "Hirs"; }
                tokens[i] = tokens[i].charAt(0) + hirs;
            } else if ( hisHis.indexOf(tokens[i]) > -1 ) 
            {
                if ( followsHirs.indexOf(tokens[i+1]) > -1 )
                {
                    var hirs;
                    if (tokens[i].charAt(0) == "h") { hirs = "hirs"; }
                    else { hirs = "Hirs"; }
                    tokens[i] = hirs;
                } else 
                {
                    var hir;
                    if (tokens[i].charAt(0) == "h") { hir = "hir"; }
                    else { hir = "Hir"; }
                    tokens[i] = hir;
                }
            }
        }
        // Check last token.
        var last = tokens.length - 1;
        if (hisPunc.indexOf(tokens[last]) > -1)
        {
            var hirs;
            if (tokens[last].charAt(0) == "h") { hirs = "hirs"; }
            else { hirs = "Hirs"; }
            tokens[last] = hirs + tokens[last].slice(-1);
        } else if (hisHis.indexOf(tokens[last]) > -1) 
        {
            var hirs;
            if (tokens[last].charAt(0) == "h") { hirs = "hirs"; }
            else { hirs = "Hirs"; }
            tokens[last] = hirs;
        }
        return tokens.join(" ");
    }

    // For elements with short text that have no space in it.
    function replaceNoSpace(text)
    {
        if (text.length > 12)
        {
            return text;
        }
        for (var i = 0; i < fromNoSpace.length; i++)
        {
            if ( text == fromNoSpace[i] )
            {
                return toNoSpace[i];
            }
        }
        return text;
    }

    // Main function that lavenderizes text.
    // Loops over a replace operator until text is stable, 
    // The replaces the his words.
    function lavenderize(text) {
        if ( text.indexOf(" ") === -1 )
        {
            return replaceNoSpace(text);
        }
        text = " " + text + " ";
        var change = true;
        while (change)
        { // wtf am I doing here? js should have a replace_all
            var newText = text;
            for (var i = 0; i < mappingTo.length; i++)
            {   
                newText = newText.replace(mappingFrom[i], mappingTo[i]);
            }
            change = ! (text.valueOf() === newText.valueOf());
            text = newText;
        }
        return replaceHis(text).slice(1,-1);
    }





    function windowLoadHandler()
    {
        // Dear Mozilla: I hate you for making me do this.
        window.removeEventListener('load', windowLoadHandler);

        document.getElementById('appcontent').addEventListener('DOMContentLoaded', function(e) {
            walk(e.originalTarget.body);
        });
    }

    window.addEventListener('load', windowLoadHandler);
}());
