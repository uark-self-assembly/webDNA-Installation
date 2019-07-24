/*
This file is part of HTMoL:
Copyright (C) 2014 Dr. Mauricio Carrillo-Tripp  
http://tripplab.com

Developers:
v1.0 Leonardo Alvarez-Rivera, Francisco Javier Becerra-Toledo, Adan Vega-Ramirez 
v2.0 Javier Garcia-Vieyra
v3.0 Omar Israel Lara-Ramirez, Eduardo González-Zavala, Emmanuel Quijas-Valades, Julio Cesar González-Vázquez
v3.5 Leonardo Alvarez-Rivera
*/

function Parameters()
{
	var Obj=this;
	this.BackgroundColor=0x000000;
	this.SetBackgroundColor=function(val)
	{
		Obj.BackgroundColor=val;
	}

	this.GetBackgroundColor=function()
	{
		return Obj.BackgroundColor;
	}
}

function Tools()
{
	var Obj=this;
	this.Representations;
	this.THREED;
	this.Color=0x00FF00;
	this.BndColor=false;
	this.BndCenter=false;
	this.BndIdentify=true;
	this.BndDistance=false;
	this.BndAngle=false;
	this.BndNameAtom=false;
	this.BndNumberAtom=false;
	this.BndDetailsAtom=false;
	this.BndNone=false;

	this.View=function(vis)
	{
		return function (event){
	    if(vis=='F'){
	    Obj.THREED.camera.position.set(0,0,100);
	    }
	    
	    if(vis=='L')
	    Obj.THREED.camera.position.set(-100,0,0);
	    
	    if(vis=='R')
	    Obj.THREED.camera.position.set(100,0,0);
	    
	    if(vis=='U')
	    Obj.THREED.camera.position.set(0,100,0);
	    
	    if(vis=='D')
	    Obj.THREED.camera.position.set(0,-100,0);
	    
	    if(vis=='B')
	    Obj.THREED.camera.position.set(0,0,-100);
		}
	}

	this.Axis=function()
	{
		return function (event){
		 if(Obj.THREED.AXIS.visible==false)
    		Obj.THREED.AXIS.visible=true;
    	else
    		Obj.THREED.AXIS.visible=false;
    	}
	}

	this.SelectColor=function(color)
	{
		return function(event){
		Obj.Color=color;
		Obj.BndColor=true;
		}
	}

	this.SelectShow=function()
	{
		return function (event)
		{
		Obj.BndColor=false;
		}
	}

	this.DefaultColor=function()
    {
    	return function (event){
	        for(var p in Obj.THREED.molecule.GetChain())
			{
			  var chain=Obj.THREED.molecule.GetChain()[p];
			  for(var y in chain.GetAminoacid())
			  {
			    var a=chain.GetAminoacid()[y];
			    for(var at in a.GetAtoms())
			    {
				var atom=a.GetAtoms()[at];
				if (atom.State=='Active')
				{
				    atom.Draw.material.color.setHex(DataAtom[atom.Element].color);
				    atom.VDW.material.color=atom.Draw.material.color;
				}
			    }
			  }
			}
		}
    }

	this.Identify=function()
	{
		return function(event){
		Obj.BndCenter=false;
		Obj.BndIdentify=true;
	    Obj.BndDistance=false;
		Obj.BndAngle=false;
		Obj.BndNameAtom=false;
		Obj.BndNumberAtom=false;
		Obj.BndDetailsAtom=false;
		Obj.BndNone=false;
		}
	}

	this.Center=function()
	{
		return function(event){
		Obj.BndCenter=true;
		Obj.BndIdentify=false;
	    Obj.BndDistance=false;
		Obj.BndAngle=false;
		Obj.BndNameAtom=false;
		Obj.BndNumberAtom=false;
		Obj.BndDetailsAtom=false;
		Obj.BndNone=false;
		}
	}

	this.NameAtom=function()
	{
		return function(event){
		Obj.BndCenter=false;
		Obj.BndIdentify=false;
	    Obj.BndDistance=false;
		Obj.BndAngle=false;
		Obj.BndNameAtom=true;
		Obj.BndNumberAtom=false;
		Obj.BndDetailsAtom=false;
		Obj.BndNone=false;
		}
	}

	this.NumberAtom=function()
	{
		return function(event){
		Obj.BndCenter=false;
		Obj.BndIdentify=false;
	    Obj.BndDistance=false;
		Obj.BndAngle=false;
		Obj.BndNameAtom=false;
		Obj.BndNumberAtom=true;
		Obj.BndDetailsAtom=false;
		Obj.BndNone=false;
		}
	}

    this.DetailsAtom=function()
	{
		return function(event)
		{
		Obj.BndCenter=false;
		Obj.BndIdentify=false;
	    Obj.BndDistance=false;
		Obj.BndAngle=false;
		Obj.BndNameAtom=false;
		Obj.BndNumberAtom=false;
		Obj.BndDetailsAtom=true;
		Obj.BndNone=false;
		}
	}

	this.Distance=function()
	{
		return function(event)
		{
		Obj.BndCenter=false;
		Obj.BndIdentify=false;
	    Obj.BndDistance=true;
		Obj.BndAngle=false;
		Obj.BndNameAtom=false;
		Obj.BndNumberAtom=false;
		Obj.BndDetailsAtom=false;
		Obj.BndNone=false;
		}
	}

	this.Angle=function()
	{
		return function(event)
		{
		Obj.BndCenter=false;
		Obj.BndIdentify=false;
	    Obj.BndDistance=false;
		Obj.BndAngle=true;
		Obj.BndNameAtom=false;
		Obj.BndNumberAtom=false;
		Obj.BndDetailsAtom=false;
		Obj.BndNone=false;
		}
	}

	this.None=function()
	{
		return function(event)
		{
		Obj.BndCenter=false;
		Obj.BndIdentify=false;
	    Obj.BndDistance=false;
		Obj.BndAngle=false;
		Obj.BndNameAtom=false;
		Obj.BndNumberAtom=false;
		Obj.BndDetailsAtom=false;
		Obj.BndNone=true;
		}
	}

	this.SelectChain=function(chain,button)
	{
		return function ( event )
		{
		    if (Obj.BndColor==false)
			{
			if(chain.State=='Inactive'){
			  chain.State='Active';
			  button.style.color='#ffffff';
			}
			else{
			  chain.State='Inactive';
			  button.style.color='rgb(255,0,0)';
			}
			  
			  
			  for(var y in chain.GetAminoacid())
			  {
			    var a=chain.GetAminoacid()[y];
			    if(a.State=='Active')
			    {
				for(var at in a.GetAtoms())
				{
				    var atom=a.GetAtoms()[at];
				    if(chain.State=='Active')
				    {
					
					atom.State='Active';
					
				    }else
				    {
					atom.State='Inactive';
				    }
				}
				
			    }
			  }
			 
			  Obj.Evaluations();
			}else
			{
				for(var y in chain.GetAminoacid())
				  {
				    var a=chain.GetAminoacid()[y];
					for(var at in a.GetAtoms())
					{
					    var atom=a.GetAtoms()[at];
						atom.Draw.material.color.setHex(Obj.Color);
						atom.VDW.material.color=atom.Draw.material.color;
					}
				  }
				  Obj.Representations.Skeleton.Evaluation('color');
			}
		}   

	}

	this.ByAmino=function(chains,name)
	{
		return function(event)
		{
			if (Obj.BndColor==false)
			{	
			for(var p in chains)
		    {
		       var chain=chains[p];
		       if(chain.State=='Active')
		       {
			   for(var y in chain.GetAminoacid())
			   {
			   var a=chain.GetAminoacid()[y];
			     if(a.Name==name)
			     {
					 a.State='Active';
					 for(var at in a.GetAtoms())
					 {
					     var atom=a.GetAtoms()[at];
					     
						 if (atom.State=='Inactive')
						 {
						   atom.State='Active';
						 }
					 }
			     }
			     else
			     {
				 	a.State='Inactive';
					 for(var at in a.GetAtoms())
					 {
					     var atom=a.GetAtoms()[at];	
						   atom.State='Inactive';	
					 }
			     }
			     
			 }
		     }
		 }
		 Obj.Evaluations();
		}
		else
		{
			for(var p in chains)
			 {
			   var chain=chains[p];
			    for(var y in chain.GetAminoacid())
			    {
			     var a=chain.GetAminoacid()[y];
				if(a.Name==name)
				{
				    for(var at in a.GetAtoms())
				    {
					var atom=a.GetAtoms()[at];
				       atom.Draw.material.color.setHex(Obj.Color);
				       atom.VDW.material.color.setHex(Obj.Color);
				    }
				}
			    }
			 }
			 Obj.Representations.Skeleton.Evaluation('color');
		}
		}
	
	}


	this.ByAtoms=function(chains,element)
	{
		return function(event)
		{
			if (Obj.BndColor==false)
			{
			for(var p in chains)
			 {
			   var chain=chains[p];
			     for(var y in chain.GetAminoacid())
			    {
				    var a=chain.GetAminoacid()[y];
				    if(a.State=='Active')
				    {
						 for(var at in a.GetAtoms())
						 {
						     var atom=a.GetAtoms()[at];
						     if(atom.Element==element)
						     {
								if (atom.State=='Inactive')
								 {
								   atom.State='Active';
								 }
						     }else
						     {
							 	atom.State='Inactive';
						     }
						 }
					}
			     }
			 }
	 
			Obj.Evaluations();
			}
			else
			{
				for(var p in chains)
				 {
				   var chain=chains[p];
				    for(var y in chain.GetAminoacid())
				    {
				     var a=chain.GetAminoacid()[y];
						for(var at in a.GetAtoms())
						{
						    var atom=a.GetAtoms()[at];
						    if(atom.Element==element)
						    {
							atom.Draw.material.color.setHex(Obj.Color);
							atom.VDW.material.color.setHex(Obj.Color);
						    }
						}
				    }
				 }
				 Obj.Representations.Skeleton.Evaluation('color');
			}
		}
	}

	this.All=function()
	{
		return function (event)
		{
			for(var p in Obj.THREED.molecule.GetChain())
		    {
			    var chain=Obj.THREED.molecule.GetChain()[p];
			    chain.State='Active';
				for(var y in chain.GetAminoacid())
			    {
				 var a=chain.GetAminoacid()[y];
				 a.State='Active';
				    for(var at in a.GetAtoms())
				    {
					var atom=a.GetAtoms()[at];
					    if (atom.State=='Inactive')
					    {
					      atom.State='Active';
					    }
				    }
				}
		    }
		    
		    for(var i in Obj.THREED.LstButtonsChain)
		    {
			var t =Obj.THREED.LstButtonsChain[i];
			t.style.color='#ffffff';
		    }
		    Obj.Evaluations();
		}
	}

	this.Evaluations=function()
	{
		Obj.Representations.Skeleton.Evaluation();
		Obj.Representations.VDW.Evaluation();
		Obj.Representations.Bonds.Evaluation();
        Obj.EvaluationMeasures();
        Obj.EvaluationMarkers();
	}


	this.ShowMarkers=function()
    {
    	return function(event){
			if(Obj.THREED.LstMarkers.length>0)
			{
				for(var m in Obj.THREED.LstMarkers)
				{
				    var marker=Obj.THREED.LstMarkers[m];
				    marker.Draw.material.visible=true;
				}
			}
		}
    }
    
    this.HideMarkers=function()
    {
    	return function (event){
			if(Obj.THREED.LstMarkers.length>0)
			{
				for(var m in Obj.THREED.LstMarkers)
				{
				    var marker=Obj.THREED.LstMarkers[m];
				    marker.Draw.material.visible=false;
				}
			}
		}
    }
    
    this.DeleteMarkers=function()
    {
    	return function (event){
			Obj.THREED.DeleteMarkers();
		}

    }

    this.DeleteMeasures=function()
    {
    	return function (event){
			Obj.THREED.DeleteMeasures();
		}
    }

    this.EvaluationMarkers=function()
    {
	if(Obj.THREED.LstMarkers.length>0){
	    for(var m in Obj.THREED.LstMarkers)
	    {
		var marker=Obj.THREED.LstMarkers[m];
		if(marker.Atom.State=="Active")
		    marker.Draw.material.visible=true;
		else
		    marker.Draw.material.visible=false;    
	    }
	}
    }
    
    this.EvaluationMeasures=function()
    {
		for(var t in Obj.THREED.Data)
		{
		    var measure=Obj.THREED.Data[t];
		    var bnd=false;
			for(var u in measure.LstAtoms)
			{
			    var atom=measure.LstAtoms[u];
			    if(atom.State=='Inactive')
			    bnd=true;
			}
			
		    if(bnd==true){
			measure.Marker.material.visible=false;
			for(var u in measure.LstLines)
			{
			    var line=measure.LstLines[u];
			    line.material.visible=false;
			}
			
			for(var u in measure.LstAtoms)
			{
			    var atom=measure.LstAtoms[u];
			    atom.Draw.material.wireframe=false;
			    atom.Draw.material.color.setHex(DataAtom[atom.Element].color);
			    atom.VDW.material.color=atom.Draw.material.color;
			}
		    }else
		    {
			measure.Marker.material.visible=true;
			for(var u in measure.LstLines)
			{
			    var line=measure.LstLines[u];
			    line.material.visible=true;
			}
			for(var u in measure.LstAtoms)
			{
			    var atom=measure.LstAtoms[u];
			    atom.Draw.material.wireframe=true;
			    atom.Draw.material.color.setHex(0x40FF00);
			    atom.VDW.material.color=atom.Draw.material.color;
			}
		    }
		}
    }
}
