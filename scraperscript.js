/* Load jQuery */
_jquery_script=document.createElement("SCRIPT");
_jquery_script.type="text/javascript";
_jquery_script.src="http://cryto.net/scraperscript/jquery.js";
document.getElementsByTagName('head')[0].appendChild(_jquery_script);

function _jquery_done()
{
	function genPath(stack)
	{
		path = "";
			
		for(i in stack)
		{
			var item = stack[i];
			
			if(typeof item == "undefined")
			{
				continue;
			}
			
			if(typeof item.id !== "undefined")
			{
				selector = "#" + item.id;
			}
			else
			{
				selector = item.name;
				
				if(typeof item.class !== "undefined")
				{
					selector += "." + item.class;
				}
				
				if(typeof item.index !== "undefined")
				{
					selector += ":nth-of-type(" + item.index + ")";
				}
			}
			
			if(typeof item.optimized !== "undefined" && item.optimized == true)
			{
				path = (path == "") ? selector : selector + " " + path;
			}
			else
			{
				path = (path == "") ? selector : selector + " > " + path;
			}
		}

		return path;
	}
	
	jQuery.fn.extend({
		getPath: function () {
			var node = this;
			
			var node_stack = [];
			
			while (node.length) {
				var real_node = node[0];
				
				if(!real_node.localName)
				{
					break;
				}
				
				var node_name = real_node.localName.toLowerCase();
				var parent = node.parent();
				
				/* First see if this element has an ID (which will be unique). */
				node_id = node.attr("id");
				
				if(node_id)
				{
					/* That's all we need. Abort traversal. */
					node_stack.push({id: node_id});
					node = parent;
					break;
				}
				
				/* Then attempt to figure out whether this is the only element with this tag name. */
				var same_tag_siblings = parent.children(node_name);
				
				if(same_tag_siblings.length == 1)
				{
					/* That's all we need for this node then. */
					node_stack.push({name: node_name});
					node = parent;
					continue;
				}
				
				/* If there's more than one tag with this name, we'll try to figure out a unique selector based on the class. */
				
				var class_list = node.attr("class");
				
				node_classes = (class_list) ? class_list.trim().split(/\s+/) : [];
				
				var lone_classes = [];
				var least_sibling_class = null;
				
				for(i in node_classes)
				{
					var same_tag_class_siblings = parent.children(node_name + "." + node_classes[i]);
					
					if(same_tag_class_siblings.length == 1)
					{
						lone_classes.push(node_classes[i]);
					}
					else if(!least_sibling_class || same_tag_class_siblings.length < least_sibling_class.length)
					{
						least_sibling_class = {
							name: node_classes[i],
							length: same_tag_class_siblings.length
						};
					}
				}
				
				if(lone_classes.length > 0)
				{
					node_stack.push({name: node_name, class: lone_classes[0]});
					node = parent;
					continue;
				}
				
				
				/* We *still* haven't figured out a unique way to select the element.
				 * Last resort: nth-of-type. */
				var sibling_source = parent.children(node_name);
				node_index = sibling_source.index(real_node) + 1;
				node_stack.push({name: node_name, index: node_index});
				node = parent;
				continue;
			}
			
			/* Check if it is indeed unique. */
			
			path = genPath(node_stack);
			
			var result_count = $(path).length;
			
			if(result_count > 1)
			{
				return "An error occurred, the selector was not unique! Report this to admin@cryto.net.";
			}
			
			/* We'll attempt to optimize out redundant selectors now, by simply checking what we can remove without losing 
			 * uniqueness. First find the first element that does *not* have an index and start at the parent of that element. 
			 * We want to make sure that there's always at least one index-less parent, to reduce selector fragility. 
			 */
			
			var current_element = -1;
			
			for(i in node_stack)
			{
				if(i < node_stack.length - 1)
				{
					if(typeof node_stack[i].index == "undefined")
					{
						current_element = parseInt(i) + 1;
						break;
					}
				}
			}
			
			/* We found our starting position. Continue to try and remove nodes as much as we can. */
			if(current_element !== -1)
			{
				while(current_element < node_stack.length)
				{
					var new_stack = node_stack.slice(0);
					var i = new_stack.splice(current_element, 1)[0];
					var next_element = new_stack[current_element];
					
					if(typeof next_element !== "undefined")
					{
						next_element.optimized = true;
					}
					
					var result_count = $(genPath(new_stack)).length;
					
					if(result_count > 1 || result_count == 0)
					{
						if(typeof i.index == "undefined")
						{
							current_element += 1;
						}
						else
						{
							current_element += 2;
						}
						
						if(typeof next_element !== "undefined")
						{
							next_element.optimized = false;
						}
					}
					else
					{
						node_stack = new_stack;
					}
				}
				
				path = genPath(node_stack);
			}
			return path;
		}
	});
	
	$("body").css({"margin-bottom": (parseInt($("body").css("margin-bottom").replace("px", "")) + 48) + "px"});
	$('<div class="scraperscript" id="scraperscript_bar" style="position: fixed; bottom: 0px; left: 0px; right: 0px; height: 36px; padding: 6px; background-color: #EBEBEB; '+
	  'color: black; font-family: sans-serif; font-size: 13px; text-align: left; box-sizing: content-box; z-index: 9999999999;"><strong class="scraperscript" '+
	  'style="margin-right: 8px; font-weight: bold;">ScraperScript</strong> Current selector: <span class="scraperscript" id="scraperscript_selector" style="font-style: italic;">'+
	  'None</span> <div class="scraperscript">Be awesome, make information free :)</div><div class="scraperscript" id="scraperscript_close" style="position: absolute; '+
	  'text-align: center; top: 6px; right: 6px; width: 16px; height: 16px; border: 1px solid red; color: red; background-color: #FFD6D6; cursor: pointer;">X</div></div>').appendTo("body");
	  
	$("*:not(.scraperscript)").each(function(){
		$(this).on("click.ScraperScript", function(event){
			$("#scraperscript_selector").html($(this).getPath());
			event.stopPropagation();
			return false;
		});
		
		$(this).on("keydown.ScraperScript", function(event){
			event.stopPropagation();
			return false;
		});
		
		$(this).on("mouseover.ScraperScript", function(event){
			$(this).css({"outline": "2px solid red"});
			event.stopPropagation();
			return false;
		});
		
		$(this).on("mouseout.ScraperScript", function(event){
			$(this).css({"outline": ""});
			event.stopPropagation();
			return false;
		});
	});
	
	$("form").on("submit.ScraperScript", function(event){ event.stopPropagation(); return false; });
	
	$(".scraperscript:not(#scraperscript_close)").each(function(){
		$(this).on("click.ScraperScript", function(event){
			event.stopPropagation();
			return false;
		});
		
		$(this).on("mouseover.ScraperScript", function(event){
			event.stopPropagation();
			return false;
		});
		
		$(this).on("mouseout.ScraperScript", function(event){
			event.stopPropagation();
			return false;
		});
	});
	
	$("#scraperscript_close").click(function(){
		$("*").each(function(){
			$(this).off("click.ScraperScript");
			$(this).off("submit.ScraperScript");
			$(this).off("keydown.ScraperScript");
			$(this).off("mouseover.ScraperScript");
			$(this).off("mouseout.ScraperScript");
		});
		
		$("#scraperscript_bar").remove();
	});
}
