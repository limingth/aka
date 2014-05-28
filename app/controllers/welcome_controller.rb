class WelcomeController < ApplicationController
  layout 'no_header_footer', :only => [:classroom]
  def index
  end

  def try
  end

  def novnc
  end

  def doudoujia
  end

  def classroom
    @username = "liujiyang"
  end
end
