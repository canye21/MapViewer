using System;
using System.Threading;
using System.Drawing;
using System.Configuration;

public partial class WebGis_Map : System.Web.UI.Page
{
    protected string mapUrl = string.Empty;//地图的路径
    protected string maxZoomLevel = "19"; //最大地图级别
    protected string minZoomLevel = "5"; //最小地图级别
    protected string center = "POINT(115.33 37.33)";//当前中心点
    protected string originalCenter = "POINT(116.33 37.33)";//原始中心点
    protected string originalZoomLevel = "5";//默认原始地图显示级别
    protected string defaultLevel = "5";   //默认地图级别

    protected void Page_Load(object sender, EventArgs e)
    {
        if (!IsPostBack)
        {
            mapUrl = ConfigurationManager.AppSettings["mapUrl"].ToString();
        }
    }
}