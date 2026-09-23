//INIT VARS
var color = [
    ["#003466", "#2d71b3", "#5082b3"],
    ["#ffc904", "#ffd743", "#ffe275"],
    ["#c8102d", "#e3475f", "#e37083"],
    ["#00853e", "#31c274", "#57c289"],
    ["#808080", "#a7a7a7", "#e2e2e2"],
    ["#003466", "#2d71b3", "red"]
],
stack         = d3.layout.stack(),
labelFormat   = d3.format(".cell-label");

//SIZE AND MARGINS
function dims(d){
  var margin  = {top: 10, right: 0, bottom: 8, left: 62},
      width   = $("body").width()/(d*1.0) - margin.left - margin.right,
      height  = window.innerHeight/(d*1.0) - margin.top - margin.bottom;
  return {'margin':margin, 'width':width, 'height':height};
}

//LOAD CSV
d3.csv("nruf.csv", type, function(error, data) {

  //REMOVE UNWANTED ROWS
  var length = 0;
  data.splice(0, 5); //First five rows
  $.each(data, function(i){
    if(i < data.length-1){
      switch(data[i]["chartData"]["label"]){
        case "SAT Average* ":
          data.splice(i, 1);
          length++;
          break;
        case "PhDs Awarded":
          data.splice(i, 1);
          length++;
          break;
      }  
    }

  });
  data.splice((data.length-4), 4); //Last four rows
  length+4;

  data.length = data.length-length;

  //POPULATE CHOOSER
  $.each(data, function(i){
    $("#chooser select")
      .append($("<option></option>")
      .attr("value", i)
      .text(data[i]["chartData"].label));
      i++;
  });

  //INITIAL LOAD
  $(window).ready(function(){
    $("body").css('background-size', "100% "+window.innerHeight+"px");
    $(window).resize(function(){
      $("body").css('background-size', "100% "+window.innerHeight+"px");
    });

    $(".header").css("left", window.innerWidth/2 - $(".header").width()/2);
    $(".content").css('margin-top', $(".header").outerHeight());

    var prestack = [data[0]["chartData"]/*, data[1]["chartData"], data[14]["chartData"]*/];
    $(".title .titleEl").html(prestack[0].label);
    $(".notes").html("<span>Explanatory Notes:</span> "+prestack[0].notes);

    draw(prestack, "#singleChart", 1);
  });

  //SINGLE CHART TAB
  $("#intTab").click(function(){
    var prestack = [data[0]["chartData"]/*, data[1]["chartData"], data[14]["chartData"]*/]; 
    $(".title .titleEl").html(prestack[0].label);
    $(".notes").html("<span>Explanatory Notes:</span> "+prestack[0].notes);

    draw(prestack, "#singleChart", 1);
  });

  //CHART GALLERY TAB
  $("#galTab").click(function(){

    $('#gal div').remove();

    $.each(data, function(i){

      var prestack = [data[i]["chartData"]]; 

      //DRAW GRAPH OR DISPLAY HTML CONTENT
      function htmContent(i){
        $("#gal").append('<div class="chart" id="chart'+i+'"></div>');
        $("#chart"+i).append('<div class="title"></div>');
        $("#chart"+i+" .title").append('<h2 class="titleEl"></h2>');
        $("#chart"+i).append('<div class="alt"></div>')
        $("#chart"+i).append('<div class="notes"></div>');
      }

      switch(prestack[0]["label"]){
        case "Carnegie Classification Ranking":
          htmContent(i);
          $("#chart"+i+" .title .titleEl").text(prestack[0]["label"]);
          $("#chart"+i+" .alt").html($('#alts #carnegie').html());
          $("#chart"+i+" .notes").html("<span>Explanatory Notes:</span> "+prestack[0].notes);       
          break;

        default:
          $("#gal").append('<div class="chart" id="chart'+i+'"></div>');
          $("#chart"+i).append('<div class="title"></div>');
          $("#chart"+i+" .title").append('<h2 class="titleEl"></h2>');
          $("#chart"+i+" .title .titleEl").text(prestack[0]["label"]);

          $("#chart"+i).append('<svg></svg>');
          $("#chart"+i).append('<div class="notes"></div>');
          $("#chart"+i+" .notes").html("<span>Explanatory Notes:</span> "+prestack[0].notes);

          (window.innerWidth > 1024?
            draw(prestack, "#chart"+i+" svg", 2):
            draw(prestack, "#chart"+i+" svg", 1))
      }



    });

  }); 

  $(document).on("change", "#chooser select", function(){

    //LIMIT SELECTION TO THREE
    /*var last_valid_selection = null;
    if ($(this).val().length > 1) { //Change for stacked graph
      $(this).val(last_valid_selection);
    } else {
      last_valid_selection = $(this).val();
    }*/

    var array = data[$(this).attr("value")];
    prestack = new Array();

    $("#chooser select option:selected").each(function(){
      prestack.push(data[$(this).attr("value")]["chartData"]);
    });
    $(".title .titleEl").html(prestack[0].label);
    $(".notes").html("<span>Explanatory Notes:</span> "+prestack[0].notes);

    //DRAW GRAPH OR DISPLAY HTML CONTENT
    $("#chart .diff").remove();
    $("#chart svg")
      .css("display", "none");
    $("#chart .alt")
      .css("display", "block");

    switch(prestack[0]["label"]){
      case "Carnegie Classification Ranking":
        $("#chart .alt")
          .html($('#alts #carnegie').html());
        break;

      case "SAT Average* ":
        $("#chart .alt")
          .html($('#alts #sat').html());
        break;

      case "PhDs Awarded":
        $("#chart .alt")
          .html($('#alts #phd').html());
        break;

      default:
        $("#chart svg")
          .css("display", "block");
        $("#chart .alt")
          .css("display", "none");
        draw(prestack, "#singleChart", 1);
    }

  });


  function draw(prestack, id, col){
    $(id+" .container").remove();

    var delay = 750,
      duration = 750;

    var margin  = {
      top:dims(col).margin.top, 
      right: dims(col).margin.right, 
      bottom: dims(col).margin.bottom, 
      left: dims(col).margin.left},
        w0 = dims(col).width,
      width   = (w0 < $("body").width()?w0:$("body").width()) - margin.left - margin.right,
        divHeights = $(".header").height() + $("#chooser").height() + $(".title").height() + $("#footer").height() + $(".notes").height()+20,
        h0 = window.innerHeight/(col*1.1) - margin.top - margin.bottom - divHeights,
      height  = (h0 < 300?300:h0);

    var yTick = d3.format("s");
    var layers = stack(prestack),
      yGroupMax = d3.max(layers, function(layer) { 
        return d3.max(layer, function(d) { return d.y; }); }),
      yStackMax = d3.max(layers, function(layer) { return d3.max(layer, function(d) { 
        return d.y0 + d.y; }); }),
      x = d3.scale.ordinal()
        .domain(["UCSB", "UCF", "UH", "UNT", "Average"])
        .range([0, 1, 2, 3, 4])
        .rangeRoundBands([0, width], .08),
      y = d3.scale.linear()
        .domain([0, yStackMax])
        .range([height, 0]),
      xAxis = d3.svg.axis()
        .scale(x)
        .tickSize(0)
        .tickPadding(6)
        .orient("bottom"),
      yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .tickFormat(function(d){
          return (d >= 1000?yTick(d):d);
        });

    //TOTAL DIFF VALUES FOR STACKED GRAPH
    //var totalUNT = 0;
    //var totalAVG = 0;
    var totalDIFF = 0;
    var displayDIFF = "block";
    for(p=0;p<layers.length;p++){
      //totalUNT  += layers[p][3].y;
      //totalAVG  += layers[p][4].y;
      totalDIFF += parseFloat(layers[p][5].VAL) / 100.0;
      displayDIFF = (layers[p].label == "Institutional Ranking - USNWR (Fall 2014)"?
          "none":
          "block");
    }
    var DIFF = {
      "value":((totalDIFF / layers.length)*100).toFixed(2)+"%",
      "display":displayDIFF
      };

    //SELECT SVG
    var svg = d3.select(id)
        .attr("width", width + margin.left + margin.right) 
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("class", "container")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    //STACK LAYERS
    var layer = svg.selectAll(".layer")
        .data(layers)
      .enter().append("g")
        .attr("class", "layer")
        .attr("data-layer", function(d, i){return i});

    //BARS
    var rect = layer.selectAll("rect")
        .data(function(d) { return d; })
      .enter().append("rect")
        .attr("x", function(d) { return x(d.x); })
        .attr("y", height)
        .attr("width", x.rangeBand())
        .attr("height", 0)
        .style("fill", function(d, i) { 
          colorSet = this.parentNode.getAttribute("data-layer");
          return color[i][colorSet]; 
        });

    //BAR IMAGES
    var img = layer.selectAll('.layer')
        .data(function(d) { return d; })
      .enter().append("image")
        .attr("xlink:href",     function(d){
          switch(d.x){
            case "UCSB":
              return "images/cropd-ucsb.png";
            case "UCF":
              return "images/cropd-ucf.png";
            case "UH":
              return "images/cropd-uh.png";
            case "UNT":
              return "images/cropd-unt.png";     
            case "Average":
              return "images/cropd-avg.png";
            default:
              return "";           

          }
        })
        .attr("width",        function(){
          return (x.rangeBand() < 117?
            x.rangeBand():
            117)
        })
        .attr("height",       function(){
          return (x.rangeBand() < 117?
            x.rangeBand()*1.76:
            206)
        })
        .attr("display",        function(d){
          return (this.parentNode.getAttribute("data-layer") == prestack.length-1? 
            "block":
            "none")
        })
        .attr("x",  function(d) { 
          return x(d.x); })
        .attr("y",  height)
        .attr("opacity", 0);

    //BAR QUANTITY LABELS
    var qty = d3.format(","),
    cellLabel = layer.selectAll("text")
        .data(function(d) { return d; })
      .enter().append("text")
        .attr("class",    "cell-label")
        .attr("x",        function(d, i) { 
          return x(d.x) + x.rangeBand() - 10; })
        .attr("y",        height)
        .attr("dy",       ".71em")
        .style("fill",    "white")
        .text(            function(d){ 
          return qty(d.y) + (prestack[0]["percent"]?"%":"") 
        });

    //DIFF LABEL
    $('#'+$(id).parent('div')
      .attr('id')+' .diff')
      .remove();
    $(id).parent()
      .append('<div class="diff"></div>');  
    $('#'+$(id).parent('div')
      .attr('id')+' .diff')
      .html(DIFF["value"].replace('-', '&#8209;'))
      .css("left", width-(width*0.05))
      .css("display", DIFF.display);

    //AXES
    svg.append("g") 
        .attr("class", "x axis") 
        .attr("transform", "translate(0," + (height-30) + ")")
        .attr("fill", "white")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);

    //TRANSITIONS
    cellLabel.transition()
        .delay(delay)
        .duration(duration)
        .attr("y", function(d) { return y(d.y0 + d.y) + 11; });

    rect.transition()
        .delay(delay)
        .duration(duration)
        .attr("y", function(d, i) { return y(d.y0 + d.y); })
        .attr("height", function(d) { return y(d.y0) - y(d.y0 + d.y); });

    img.transition()
        .delay(delay)
        .duration(duration)
        .attr("y",  function(d) { return y(d.y0 + d.y); })
        .attr("opacity", 1);;
  }

});


function prestack(dataArray){

  var height = dataArray.length,
  width = dataArray[0].length,
  ret = new Array(dataArray[0].length);

  for(i=0;i<width;i++){
    ret[i] = new Array(height);
    for(p=0;p<height;p++)
      ret[i][p] = dataArray[p][i];
  }

  return ret;
}

function type(d) {

  d["chartData"] = [
    {x: 'UCSB',        y:saniP(d["UCSB (110705)"])},
    {x: 'UCF',         y:saniP(d["UCF (132903)"])},
    {x: 'UH',          y:saniP(d["UH (225511)"])},
    {x: 'UNT',         y:saniP(d["UNT (227216)"])},
    {x: 'Average',     y:saniP(d["UCF/UCSB/UH Avg"])},

    //This is not a column and had to be hidden. x=UNT, y=0 to get rid of JS errors.
    {DIFF: 'Difference',  VAL:d["Percent Difference Peers & UNT"], x:'UNT', y:0}
  ];

  d["chartData"]["label"] = d["IPEDS ID"];
  d["chartData"]["notes"] = d["Notes"];

  if(d["UCSB (110705)"].indexOf("%") > 0){
    d["chartData"]["percent"] = 1;
  } else{
    d["chartData"]["percent"] = 0;
  }

  return d;

}

function saniP(d){

  e = replaceAll(',', '', d);

  return (e.indexOf("%") > 0?
    +e.substring(0, d.length - 1):
    +e)

}

function replaceAll(find, replace, str) {

  return str.replace(new RegExp(find, 'g'), replace);
  
}