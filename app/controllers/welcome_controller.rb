class WelcomeController < ApplicationController
  layout 'no_header_footer', :only => [:classroom, :classroom2]
  def index
  end

  def try
  end

  def novnc
  end

  def doudoujia
  end

  def classroom
    render :layout => 'no_header_footer'
  end
end
