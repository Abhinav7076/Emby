﻿using ImageMagickSharp;
using MediaBrowser.Common.Configuration;
using MediaBrowser.Server.Implementations.Drawing;
using MediaBrowser.Server.Implementations.Photos;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;

namespace MediaBrowser.Server.Implementations.UserViews
{
    public class StripCollageBuilder
    {
        private readonly IApplicationPaths _appPaths;

        public StripCollageBuilder(IApplicationPaths appPaths)
        {
            _appPaths = appPaths;
        }

        public Stream BuildPosterCollage(IEnumerable<string> paths, int width, int height, bool renderWithText, string text)
        {
            if (renderWithText)
            {
                using (var wand = BuildPosterCollageWandWithText(paths, text, width, height))
                {
                    return DynamicImageHelpers.GetStream(wand, _appPaths);
                }
            }
            using (var wand = BuildPosterCollageWand(paths, width, height))
            {
                return DynamicImageHelpers.GetStream(wand, _appPaths);
            }
        }

        public Stream BuildSquareCollage(IEnumerable<string> paths, int width, int height, bool renderWithText, string text)
        {
            if (renderWithText)
            {
                using (var wand = BuildSquareCollageWandWithText(paths, text, width, height))
                {
                    return DynamicImageHelpers.GetStream(wand, _appPaths);
                }
            }
            using (var wand = BuildSquareCollageWand(paths, width, height))
            {
                return DynamicImageHelpers.GetStream(wand, _appPaths);
            }
        }

        public Stream BuildThumbCollage(IEnumerable<string> paths, int width, int height, bool renderWithText, string text)
        {
            if (renderWithText)
            {
                using (var wand = BuildThumbCollageWandWithText(paths, text, width, height))
                {
                    return DynamicImageHelpers.GetStream(wand, _appPaths);
                }
            }
            using (var wand = BuildThumbCollageWand(paths, width, height))
            {
                return DynamicImageHelpers.GetStream(wand, _appPaths);
            }
        }

        private string[] ProjectPaths(IEnumerable<string> paths, int count)
        {
            var clone = paths.ToList();
            var list = new List<string>();

            while (list.Count < count)
            {
                foreach (var path in clone)
                {
                    list.Add(path);

                    if (list.Count >= count)
                    {
                        break;
                    }
                }
            }

            return list.Take(count).ToArray();
        }

        private MagickWand BuildThumbCollageWandWithText(IEnumerable<string> paths, string text, int width, int height)
        {
            var inputPaths = ProjectPaths(paths, 8);
            using (var wandImages = new MagickWand(inputPaths))
            {
                var wand = new MagickWand(width, height);
                wand.OpenImage("gradient:#111111-#111111");
                using (var draw = new DrawingWand())
                {
                    using (var fcolor = new PixelWand(ColorName.White))
                    {
                        draw.FillColor = fcolor;
                        draw.Font = MontserratLightFont;
                        draw.FontSize = 60;
                        draw.FontWeight = FontWeightType.LightStyle;
                        draw.TextAntialias = true;
                    }

                    var fontMetrics = wand.QueryFontMetrics(draw, text);
                    var textContainerY = Convert.ToInt32(height * .165);
                    wand.CurrentImage.AnnotateImage(draw, (width - fontMetrics.TextWidth) / 2, textContainerY, 0.0, text);

                    var iSlice = Convert.ToInt32(width * .1166666667);
                    int iTrans = Convert.ToInt32(height * 0.2);
                    int iHeight = Convert.ToInt32(height * 0.46296296296296296296296296296296);
                    var horizontalImagePadding = Convert.ToInt32(width * 0.0125);

                    foreach (var element in wandImages.ImageList)
                    {
                        int iWidth = (int)Math.Abs(iHeight * element.Width / element.Height);
                        element.Gravity = GravityType.CenterGravity;
                        element.BackgroundColor = new PixelWand("none", 1);
                        element.ResizeImage(iWidth, iHeight, FilterTypes.LanczosFilter);
                        int ix = (int)Math.Abs((iWidth - iSlice) / 2);
                        element.CropImage(iSlice, iHeight, ix, 0);

                        element.ExtentImage(iSlice, iHeight, 0 - horizontalImagePadding, 0);
                    }

                    wandImages.SetFirstIterator();
                    using (var wandList = wandImages.AppendImages())
                    {
                        wandList.CurrentImage.TrimImage(1);
                        using (var mwr = wandList.CloneMagickWand())
                        {
                            using (var blackPixelWand = new PixelWand(ColorName.Black))
                            {
                                using (var greyPixelWand = new PixelWand(ColorName.Grey70))
                                {
                                    mwr.CurrentImage.ResizeImage(wandList.CurrentImage.Width, (wandList.CurrentImage.Height / 2), FilterTypes.LanczosFilter, 1);
                                    mwr.CurrentImage.FlipImage();

                                    mwr.CurrentImage.AlphaChannel = AlphaChannelType.DeactivateAlphaChannel;
                                    mwr.CurrentImage.ColorizeImage(blackPixelWand, greyPixelWand);

                                    using (var mwg = new MagickWand(wandList.CurrentImage.Width, iTrans))
                                    {
                                        mwg.OpenImage("gradient:black-none");
                                        var verticalSpacing = Convert.ToInt32(height * 0.01111111111111111111111111111111);
                                        mwr.CurrentImage.CompositeImage(mwg, CompositeOperator.DstInCompositeOp, 0, verticalSpacing);

                                        wandList.AddImage(mwr);
                                        int ex = (int)(wand.CurrentImage.Width - mwg.CurrentImage.Width) / 2;
                                        wand.CurrentImage.CompositeImage(wandList.AppendImages(true), CompositeOperator.AtopCompositeOp, ex, Convert.ToInt32(height * 0.26851851851851851851851851851852));
                                    }
                                }
                            }
                        }
                    }
                }

                return wand;
            }
        }

        private MagickWand BuildPosterCollageWand(IEnumerable<string> paths, int width, int height)
        {
            var inputPaths = ProjectPaths(paths, 4);
            using (var wandImages = new MagickWand(inputPaths))
            {
                var wand = new MagickWand(width, height);
                wand.OpenImage("gradient:#111111-#111111");
                using (var draw = new DrawingWand())
                {
                    var iSlice = Convert.ToInt32(width * 0.225);
                    int iTrans = Convert.ToInt32(height * .25);
                    int iHeight = Convert.ToInt32(height * .65);
                    var horizontalImagePadding = Convert.ToInt32(width * 0.0275);

                    foreach (var element in wandImages.ImageList)
                    {
                        using (var blackPixelWand = new PixelWand(ColorName.Black))
                        {
                            int iWidth = (int)Math.Abs(iHeight * element.Width / element.Height);
                            element.Gravity = GravityType.CenterGravity;
                            element.BackgroundColor = blackPixelWand;
                            element.ResizeImage(iWidth, iHeight, FilterTypes.LanczosFilter);
                            int ix = (int)Math.Abs((iWidth - iSlice) / 2);
                            element.CropImage(iSlice, iHeight, ix, 0);

                            element.ExtentImage(iSlice, iHeight, 0 - horizontalImagePadding, 0);
                        }
                    }

                    wandImages.SetFirstIterator();
                    using (var wandList = wandImages.AppendImages())
                    {
                        wandList.CurrentImage.TrimImage(1);
                        using (var mwr = wandList.CloneMagickWand())
                        {
                            using (var blackPixelWand = new PixelWand(ColorName.Black))
                            {
                                using (var greyPixelWand = new PixelWand(ColorName.Grey70))
                                {
                                    mwr.CurrentImage.ResizeImage(wandList.CurrentImage.Width, (wandList.CurrentImage.Height / 2), FilterTypes.LanczosFilter, 1);
                                    mwr.CurrentImage.FlipImage();

                                    mwr.CurrentImage.AlphaChannel = AlphaChannelType.DeactivateAlphaChannel;
                                    mwr.CurrentImage.ColorizeImage(blackPixelWand, greyPixelWand);

                                    using (var mwg = new MagickWand(wandList.CurrentImage.Width, iTrans))
                                    {
                                        mwg.OpenImage("gradient:black-none");
                                        var verticalSpacing = Convert.ToInt32(height * 0.01111111111111111111111111111111);
                                        mwr.CurrentImage.CompositeImage(mwg, CompositeOperator.CopyOpacityCompositeOp, 0, verticalSpacing);

                                        wandList.AddImage(mwr);
                                        int ex = (int)(wand.CurrentImage.Width - mwg.CurrentImage.Width) / 2;
                                        wand.CurrentImage.CompositeImage(wandList.AppendImages(true), CompositeOperator.AtopCompositeOp, ex, Convert.ToInt32(height * .05));
                                    }
                                }
                            }
                        }
                    }
                }

                return wand;
            }
        }

        private MagickWand BuildPosterCollageWandWithText(IEnumerable<string> paths, string label, int width, int height)
        {
            var inputPaths = ProjectPaths(paths, 4);
            using (var wandImages = new MagickWand(inputPaths))
            {
                var wand = new MagickWand(width, height);
                wand.OpenImage("gradient:#111111-#111111");
                using (var draw = new DrawingWand())
                {
                    using (var fcolor = new PixelWand(ColorName.White))
                    {
                        draw.FillColor = fcolor;
                        draw.Font = MontserratLightFont;
                        draw.FontSize = 60;
                        draw.FontWeight = FontWeightType.LightStyle;
                        draw.TextAntialias = true;
                    }

                    var fontMetrics = wand.QueryFontMetrics(draw, label);
                    var textContainerY = Convert.ToInt32(height * .165);
                    wand.CurrentImage.AnnotateImage(draw, (width - fontMetrics.TextWidth) / 2, textContainerY, 0.0, label);

                    var iSlice = Convert.ToInt32(width * 0.225);
                    int iTrans = Convert.ToInt32(height * 0.2);
                    int iHeight = Convert.ToInt32(height * 0.46296296296296296296296296296296);
                    var horizontalImagePadding = Convert.ToInt32(width * 0.0275);

                    foreach (var element in wandImages.ImageList)
                    {
                        int iWidth = (int)Math.Abs(iHeight * element.Width / element.Height);
                        element.Gravity = GravityType.CenterGravity;
                        element.BackgroundColor = new PixelWand("none", 1);
                        element.ResizeImage(iWidth, iHeight, FilterTypes.LanczosFilter);
                        int ix = (int)Math.Abs((iWidth - iSlice) / 2);
                        element.CropImage(iSlice, iHeight, ix, 0);

                        element.ExtentImage(iSlice, iHeight, 0 - horizontalImagePadding, 0);
                    }

                    wandImages.SetFirstIterator();
                    using (var wandList = wandImages.AppendImages())
                    {
                        wandList.CurrentImage.TrimImage(1);
                        using (var mwr = wandList.CloneMagickWand())
                        {
                            using (var blackPixelWand = new PixelWand(ColorName.Black))
                            {
                                using (var greyPixelWand = new PixelWand(ColorName.Grey70))
                                {
                                    mwr.CurrentImage.ResizeImage(wandList.CurrentImage.Width, (wandList.CurrentImage.Height / 2), FilterTypes.LanczosFilter, 1);
                                    mwr.CurrentImage.FlipImage();

                                    mwr.CurrentImage.AlphaChannel = AlphaChannelType.DeactivateAlphaChannel;
                                    mwr.CurrentImage.ColorizeImage(blackPixelWand, greyPixelWand);

                                    using (var mwg = new MagickWand(wandList.CurrentImage.Width, iTrans))
                                    {
                                        mwg.OpenImage("gradient:black-none");
                                        var verticalSpacing = Convert.ToInt32(height * 0.01111111111111111111111111111111);
                                        mwr.CurrentImage.CompositeImage(mwg, CompositeOperator.DstInCompositeOp, 0, verticalSpacing);

                                        wandList.AddImage(mwr);
                                        int ex = (int)(wand.CurrentImage.Width - mwg.CurrentImage.Width) / 2;
                                        wand.CurrentImage.CompositeImage(wandList.AppendImages(true), CompositeOperator.AtopCompositeOp, ex, Convert.ToInt32(height * 0.26851851851851851851851851851852));
                                    }
                                }
                            }
                        }
                    }
                }

                return wand;
            }
        }

        private MagickWand BuildThumbCollageWand(IEnumerable<string> paths, int width, int height)
        {
            var inputPaths = ProjectPaths(paths, 8);
            using (var wandImages = new MagickWand(inputPaths))
            {
                var wand = new MagickWand(width, height);
                wand.OpenImage("gradient:#111111-#111111");
                using (var draw = new DrawingWand())
                {
                    var iSlice = Convert.ToInt32(width * .1166666667);
                    int iTrans = Convert.ToInt32(height * .25);
                    int iHeight = Convert.ToInt32(height * .62);
                    var horizontalImagePadding = Convert.ToInt32(width * 0.0125);

                    foreach (var element in wandImages.ImageList)
                    {
                        using (var blackPixelWand = new PixelWand(ColorName.Black))
                        {
                            int iWidth = (int)Math.Abs(iHeight * element.Width / element.Height);
                            element.Gravity = GravityType.CenterGravity;
                            element.BackgroundColor = blackPixelWand;
                            element.ResizeImage(iWidth, iHeight, FilterTypes.LanczosFilter);
                            int ix = (int)Math.Abs((iWidth - iSlice) / 2);
                            element.CropImage(iSlice, iHeight, ix, 0);

                            element.ExtentImage(iSlice, iHeight, 0 - horizontalImagePadding, 0);
                        }
                    }

                    wandImages.SetFirstIterator();
                    using (var wandList = wandImages.AppendImages())
                    {
                        wandList.CurrentImage.TrimImage(1);
                        using (var mwr = wandList.CloneMagickWand())
                        {
                            using (var blackPixelWand = new PixelWand(ColorName.Black))
                            {
                                using (var greyPixelWand = new PixelWand(ColorName.Grey70))
                                {
                                    mwr.CurrentImage.ResizeImage(wandList.CurrentImage.Width, (wandList.CurrentImage.Height / 2), FilterTypes.LanczosFilter, 1);
                                    mwr.CurrentImage.FlipImage();

                                    mwr.CurrentImage.AlphaChannel = AlphaChannelType.DeactivateAlphaChannel;
                                    mwr.CurrentImage.ColorizeImage(blackPixelWand, greyPixelWand);

                                    using (var mwg = new MagickWand(wandList.CurrentImage.Width, iTrans))
                                    {
                                        mwg.OpenImage("gradient:black-none");
                                        var verticalSpacing = Convert.ToInt32(height * 0.01111111111111111111111111111111);
                                        mwr.CurrentImage.CompositeImage(mwg, CompositeOperator.CopyOpacityCompositeOp, 0, verticalSpacing);

                                        wandList.AddImage(mwr);
                                        int ex = (int)(wand.CurrentImage.Width - mwg.CurrentImage.Width) / 2;
                                        wand.CurrentImage.CompositeImage(wandList.AppendImages(true), CompositeOperator.AtopCompositeOp, ex, Convert.ToInt32(height * .085));
                                    }
                                }
                            }
                        }
                    }
                }

                return wand;
            }
        }

        private MagickWand BuildSquareCollageWand(IEnumerable<string> paths, int width, int height)
        {
            var inputPaths = ProjectPaths(paths, 4);
            using (var wandImages = new MagickWand(inputPaths))
            {
                var wand = new MagickWand(width, height);
                wand.OpenImage("gradient:#111111-#111111");
                using (var draw = new DrawingWand())
                {
                    var iSlice = Convert.ToInt32(width * .225);
                    int iTrans = Convert.ToInt32(height * .25);
                    int iHeight = Convert.ToInt32(height * .63);
                    var horizontalImagePadding = Convert.ToInt32(width * 0.02);

                    foreach (var element in wandImages.ImageList)
                    {
                        using (var blackPixelWand = new PixelWand(ColorName.Black))
                        {
                            int iWidth = (int)Math.Abs(iHeight * element.Width / element.Height);
                            element.Gravity = GravityType.CenterGravity;
                            element.BackgroundColor = blackPixelWand;
                            element.ResizeImage(iWidth, iHeight, FilterTypes.LanczosFilter);
                            int ix = (int)Math.Abs((iWidth - iSlice) / 2);
                            element.CropImage(iSlice, iHeight, ix, 0);

                            element.ExtentImage(iSlice, iHeight, 0 - horizontalImagePadding, 0);
                        } 
                    }

                    wandImages.SetFirstIterator();
                    using (var wandList = wandImages.AppendImages())
                    {
                        wandList.CurrentImage.TrimImage(1);
                        using (var mwr = wandList.CloneMagickWand())
                        {
                            using (var blackPixelWand = new PixelWand(ColorName.Black))
                            {
                                using (var greyPixelWand = new PixelWand(ColorName.Grey70))
                                {
                                    mwr.CurrentImage.ResizeImage(wandList.CurrentImage.Width, (wandList.CurrentImage.Height / 2), FilterTypes.LanczosFilter, 1);
                                    mwr.CurrentImage.FlipImage();

                                    mwr.CurrentImage.AlphaChannel = AlphaChannelType.DeactivateAlphaChannel;
                                    mwr.CurrentImage.ColorizeImage(blackPixelWand, greyPixelWand);

                                    using (var mwg = new MagickWand(wandList.CurrentImage.Width, iTrans))
                                    {
                                        mwg.OpenImage("gradient:black-none");
                                        var verticalSpacing = Convert.ToInt32(height * 0.01111111111111111111111111111111);
                                        mwr.CurrentImage.CompositeImage(mwg, CompositeOperator.CopyOpacityCompositeOp, 0, verticalSpacing);

                                        wandList.AddImage(mwr);
                                        int ex = (int)(wand.CurrentImage.Width - mwg.CurrentImage.Width) / 2;
                                        wand.CurrentImage.CompositeImage(wandList.AppendImages(true), CompositeOperator.AtopCompositeOp, ex, Convert.ToInt32(height * .07));
                                    }
                                }
                            }
                        }
                    }
                }

                return wand;
            }
        }

        private MagickWand BuildSquareCollageWandWithText(IEnumerable<string> paths, string label, int width, int height)
        {
            var inputPaths = ProjectPaths(paths, 4);
            using (var wandImages = new MagickWand(inputPaths))
            {
                var wand = new MagickWand(width, height);
                wand.OpenImage("gradient:#111111-#111111");
                using (var draw = new DrawingWand())
                {
                    using (var fcolor = new PixelWand(ColorName.White))
                    {
                        draw.FillColor = fcolor;
                        draw.Font = MontserratLightFont;
                        draw.FontSize = 60;
                        draw.FontWeight = FontWeightType.LightStyle;
                        draw.TextAntialias = true;
                    }

                    var fontMetrics = wand.QueryFontMetrics(draw, label);
                    var textContainerY = Convert.ToInt32(height * .165);
                    wand.CurrentImage.AnnotateImage(draw, (width - fontMetrics.TextWidth) / 2, textContainerY, 0.0, label);

                    var iSlice = Convert.ToInt32(width * .225);
                    int iTrans = Convert.ToInt32(height * 0.2);
                    int iHeight = Convert.ToInt32(height * 0.46296296296296296296296296296296);
                    var horizontalImagePadding = Convert.ToInt32(width * 0.02);

                    foreach (var element in wandImages.ImageList)
                    {
                        int iWidth = (int)Math.Abs(iHeight * element.Width / element.Height);
                        element.Gravity = GravityType.CenterGravity;
                        element.BackgroundColor = new PixelWand("none", 1);
                        element.ResizeImage(iWidth, iHeight, FilterTypes.LanczosFilter);
                        int ix = (int)Math.Abs((iWidth - iSlice) / 2);
                        element.CropImage(iSlice, iHeight, ix, 0);

                        element.ExtentImage(iSlice, iHeight, 0 - horizontalImagePadding, 0);
                    }

                    wandImages.SetFirstIterator();
                    using (var wandList = wandImages.AppendImages())
                    {
                        wandList.CurrentImage.TrimImage(1);
                        using (var mwr = wandList.CloneMagickWand())
                        {
                            using (var blackPixelWand = new PixelWand(ColorName.Black))
                            {
                                using (var greyPixelWand = new PixelWand(ColorName.Grey70))
                                {
                                    mwr.CurrentImage.ResizeImage(wandList.CurrentImage.Width, (wandList.CurrentImage.Height / 2), FilterTypes.LanczosFilter, 1);
                                    mwr.CurrentImage.FlipImage();

                                    mwr.CurrentImage.AlphaChannel = AlphaChannelType.DeactivateAlphaChannel;
                                    mwr.CurrentImage.ColorizeImage(blackPixelWand, greyPixelWand);

                                    using (var mwg = new MagickWand(wandList.CurrentImage.Width, iTrans))
                                    {
                                        mwg.OpenImage("gradient:black-none");
                                        var verticalSpacing = Convert.ToInt32(height * 0.01111111111111111111111111111111);
                                        mwr.CurrentImage.CompositeImage(mwg, CompositeOperator.DstInCompositeOp, 0, verticalSpacing);

                                        wandList.AddImage(mwr);
                                        int ex = (int)(wand.CurrentImage.Width - mwg.CurrentImage.Width) / 2;
                                        wand.CurrentImage.CompositeImage(wandList.AppendImages(true), CompositeOperator.AtopCompositeOp, ex, Convert.ToInt32(height * 0.26851851851851851851851851851852));
                                    }
                                }
                            }
                        }
                    }
                }

                return wand;
            }
        }

        private string MontserratLightFont
        {
            get { return PlayedIndicatorDrawer.ExtractFont("MontserratLight.otf", _appPaths); }
        }
    }
}
